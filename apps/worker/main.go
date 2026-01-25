package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
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
	fmt.Println("Worker started...")

	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://postgres:password@db:5432/furukawa_archive_production?sslmode=disable"
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Wait for DB
	for i := 0; i < 15; i++ {
		if err := db.Ping(); err == nil {
			break
		}
		fmt.Println("Waiting for DB...", err)
		time.Sleep(2 * time.Second)
	}

	ticker := time.NewTicker(6 * time.Hour)
	go syncProtopedia(db) // Initial run

	for range ticker.C {
		go syncProtopedia(db)
	}
}

func syncProtopedia(db *sql.DB) {
	fmt.Println("Starting Protopedia sync...", time.Now())

	// Real API endpoint (example user ID for 'hatake' or similar)
	// If official API is not public, we might need a specific feed URL.
	// For v1, assuming we can get a JSON list.
	// If NOT possible without scraping, we fallback to a manual list or mock for now,
	// AS PER REQUIREMENT: "API仕様が不確実な場合は...無理なスクレイピングはv1ではしない"
	// So we will stick to a placeholder that ATTEMPTS to fetch but handles failure gracefully.

	url := "https://protopedia.net/api/prototyper/hatake/works" // Hypothetical

	resp, err := http.Get(url)
	if err != nil {
		fmt.Println("Failed to fetch from Protopedia:", err)
		seedFallbackData(db)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		fmt.Println("Protopedia API returned non-200:", resp.Status)
		seedFallbackData(db)
		return
	}

	var data ProtopediaResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		fmt.Println("Failed to decode JSON:", err)
		return
	}

	for _, item := range data.Works {
		// Marshal tags to JSON for JSONB column
		tagsJson, _ := json.Marshal(item.Tags)

		_, err := db.Exec(`
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
		`, item.Title, item.Description, "https://protopedia.net/work/"+item.ID, item.ThumbnailURL, item.LikeCount, item.ID, tagsJson)

		if err != nil {
			fmt.Println("Error upserting work:", err)
		}
	}
	fmt.Println("Sync finished.")
}

func seedFallbackData(db *sql.DB) {
	// Only verify if empty to avoid overwriting real data with mocks repeatedly
	var count int
	db.QueryRow("SELECT COUNT(*) FROM works").Scan(&count)
	if count > 0 {
		return
	}

	fmt.Println("Database empty or API failed. Seeding fallback data...")

	// Fallback data
	mockWorks := []WorkItem{
		{ID: "1", Title: "LoopCutMini2", Description: "Automated tape cutter", ThumbnailURL: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b", LikeCount: 10, PublishedAt: "2024-01-01"},
		{ID: "2", Title: "Hakusan Geo League", Description: "GeoPark Game", ThumbnailURL: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9", LikeCount: 20, PublishedAt: "2025-01-01"},
	}

	for _, item := range mockWorks {
		item.Tags = []string{"System", "Fallback"}
		tagsJson, _ := json.Marshal(item.Tags)
		db.Exec(`
			INSERT INTO works (title, summary, url, thumbnail_url, like_count, external_id, published_at, tags, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, NOW(), NOW())
            ON CONFLICT DO NOTHING
		`, item.Title, item.Description, "https://protopedia.net/work/"+item.ID, item.ThumbnailURL, item.LikeCount, item.ID, tagsJson)
	}
}
