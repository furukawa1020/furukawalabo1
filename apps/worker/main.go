package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

// Simplified struct for Protopedia API response
type ProtopediaResponse struct {
	Works []WorkItem `json:"works"`
}

type WorkItem struct {
	ID           string   `json:"id"` // Protopedia ID might be number or string
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	ThumbnailURL string   `json:"mainImage"`
	LikeCount    int      `json:"likeCount"`
	PublishedAt  string   `json:"publishedAt"` // Format check needed
	Tags         []string `json:"tags"`
}

func main() {
	// Database connection with retry
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL not set")
	}

	var db *sql.DB
	var err error

	// 1. Connect to Database (Retry loop)
	for i := 0; i < 30; i++ {
		db, err = sql.Open("postgres", dbURL)
		if err == nil {
			if err = db.Ping(); err == nil {
				fmt.Println("✅ Connected to database")
				break
			}
		}
		fmt.Printf("⏳ Waiting for database... (%d/30)\n", i+1)
		time.Sleep(2 * time.Second)
	}
	if err != nil || db == nil {
		log.Fatal("Failed to connect to database after retries:", err)
	}
	defer db.Close()

	// 2. Wait for Migrations (Check if 'works' table exists)
	fmt.Println("🔍 Checking for 'works' table...")
	for i := 0; i < 30; i++ {
		var exists bool
		query := "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'works')"
		if err := db.QueryRow(query).Scan(&exists); err == nil && exists {
			fmt.Println("✅ Table 'works' found. Ready to sync.")
			break
		}
		fmt.Printf("⏳ Waiting for migrations... Table 'works' not ready yet. (%d/30)\n", i+1)
		time.Sleep(3 * time.Second)
	}

	// Run initial sync
	syncProtopedia(db)

	// Start HTTP server for manual triggers (runs in background)
	go startHTTPServer(db)

	// Start periodic sync (every 6 hours)
	ticker := time.NewTicker(6 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		syncProtopedia(db)
	}
}

func startHTTPServer(db *sql.DB) {
	http.HandleFunc("/sync", func(w http.ResponseWriter, r *http.Request) {
		// Simple token auth
		authToken := os.Getenv("WORKER_AUTH_TOKEN")
		if authToken == "" {
			authToken = "default-secret-token" // Fallback for local dev
		}

		if r.Header.Get("Authorization") != "Bearer "+authToken {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		fmt.Println("🔄 Manual sync triggered via HTTP")
		go syncProtopedia(db) // Run in background to avoid timeout

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "accepted",
			"message": "Sync started in background",
		})
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("✅ HTTP server listening on port %s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("HTTP server failed:", err)
	}
}

func syncProtopedia(db *sql.DB) {
	fmt.Println("Starting Protopedia sync...", time.Now())

	// All 43 work URLs (古川耕太郎's Protopedia works)
	workIDs := []string{
		"6345", "6347", "6348", "6349", "6549", "6554", "6555", "6613", "6692", "6694",
		"7255", "7408", "7495", "7496", "7527", "7528", "7529", "7538", "7539", "7553",
		"7571", "7600", "7617", "7648", "7672", "7694", "7833", "7834", "7842", "7844",
		"7852", "7866", "7889", "7895", "7908", "7916", "7952", "7984", "7995", "8059",
		"8097", "8147", "8150", "8176",
	}

	successCount := 0
	for i, id := range workIDs {
		url := "https://protopedia.net/prototype/" + id
		fmt.Printf("Fetching work %d/%d: %s\n", i+1, len(workIDs), url)

		work, err := fetchWorkFromURL(url, id)
		if err != nil {
			fmt.Printf("  ❌ Failed to fetch %s: %v\n", id, err)
			continue
		}

		// Save to database
		tagsJson, _ := json.Marshal(work.Tags)
		_, err = db.Exec(`
			INSERT INTO works (title, summary, url, thumbnail_url, like_count, external_id, published_at, tags, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, NOW(), NOW())
			ON CONFLICT (external_id) 
			DO UPDATE SET 
				title = EXCLUDED.title,
				summary = EXCLUDED.summary,
				like_count = EXCLUDED.like_count,
				thumbnail_url = EXCLUDED.thumbnail_url,
				tags = EXCLUDED.tags,
				updated_at = NOW()
		`, work.Title, work.Description, url, work.ThumbnailURL, work.LikeCount, id, tagsJson)

		if err != nil {
			fmt.Printf("  ❌ Error saving work %s: %v\n", id, err)
		} else {
			fmt.Printf("  ✅ Saved: %s\n", work.Title)
			successCount++
		}

		// Rate limiting: wait 500ms between requests to avoid overloading Protopedia
		time.Sleep(500 * time.Millisecond)
	}

	fmt.Printf("Sync finished. Successfully synced %d/%d works.\n", successCount, len(workIDs))
}

func fetchWorkFromURL(url, id string) (*WorkItem, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	html := string(body)

	// Simple HTML parsing (extract title, description, thumbnail)
	// Note: This is basic extraction. For production, consider using a proper HTML parser.
	work := &WorkItem{
		ID:           id,
		Title:        extractBetween(html, "<title>", "</title>"),
		Description:  extractBetween(html, `<meta name="description" content="`, `"`),
		ThumbnailURL: extractBetween(html, `<meta property="og:image" content="`, `"`),
		LikeCount:    0, // Will need more sophisticated parsing for like count
		Tags:         []string{"Protopedia"},
	}

	// Clean up title (remove " | プロトタイプ共有サイト Protopedia" suffix)
	work.Title = strings.Split(work.Title, " | ")[0]

	return work, nil
}

func extractBetween(text, start, end string) string {
	startIdx := strings.Index(text, start)
	if startIdx == -1 {
		return ""
	}
	startIdx += len(start)

	endIdx := strings.Index(text[startIdx:], end)
	if endIdx == -1 {
		return ""
	}

	return text[startIdx : startIdx+endIdx]
}

func seedFallbackData(db *sql.DB) {
	// Only verify if empty to avoid overwriting real data with mocks repeatedly
	var count int
	db.QueryRow("SELECT COUNT(*) FROM works").Scan(&count)
	if count > 0 {
		return
	}

	fmt.Println("Database empty. Seeding real project data as fallback...")

	// Real project data from achievements.yml
	mockWorks := []WorkItem{
		{ID: "sushi-piano", Title: "お寿司deゲーミングピアノ！", Description: "お寿司を叩くと光って音が鳴る、ゲーミングな楽器デバイス。技育博2025ゆめみ賞受賞。", ThumbnailURL: "https://images.unsplash.com/photo-1553621042-f6e147245754", LikeCount: 42, PublishedAt: "2025-01-01", Tags: []string{"Hardware", "Music", "Award"}},
		{ID: "menfugu", Title: "めんふぐ", Description: "メンタルヘルスと食を繋げるSNSプラットフォーム。技育博2025企業賞受賞。", ThumbnailURL: "https://images.unsplash.com/photo-1511632765486-a01980e01a18", LikeCount: 35, PublishedAt: "2025-01-01", Tags: []string{"App", "Social", "MentalHealth"}},
		{ID: "frogecho", Title: "FrogEcho 〜カエルの合唱!!!〜", Description: "カエルの鳴き声をエコーさせて楽しむインタラクティブ・サウンドインスタレーション。", ThumbnailURL: "https://images.unsplash.com/photo-1551024601-bec78aea704b", LikeCount: 28, PublishedAt: "2025-01-01", Tags: []string{"HCI", "Sound", "Art"}},
		{ID: "horse-racing-ai", Title: "金沢競馬予想AI (RTX5060版)", Description: "最新のRTX5060を搭載した競馬予想サーバー。38%の的中率を誇る。", ThumbnailURL: "https://images.unsplash.com/photo-1520333789090-1afc82db536a", LikeCount: 50, PublishedAt: "2026-01-01", Tags: []string{"AI", "ML", "GPU"}},
	}

	for _, item := range mockWorks {
		tagsJson, _ := json.Marshal(item.Tags)
		db.Exec(`
			INSERT INTO works (title, summary, url, thumbnail_url, like_count, external_id, published_at, tags, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            ON CONFLICT DO NOTHING
		`, item.Title, item.Description, "https://protopedia.net/work/"+item.ID, item.ThumbnailURL, item.LikeCount, item.ID, item.PublishedAt, tagsJson)
	}
}
