import os
import glob
import random
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

import google.generativeai as genai

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
CONTENT_DIR = os.getenv("CONTENT_DIR", "/content")
if not os.path.exists(CONTENT_DIR):
    CONTENT_DIR = os.path.join(os.path.dirname(__file__), "content")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# ---------------------------------------------------------------------------
# Knowledge base (loaded once at startup)
# ---------------------------------------------------------------------------
knowledge_base: str = ""

SYSTEM_PROMPT = """あなたは「はくちゃん」（Haku-chan）です。
furukawalab というポートフォリオサイトの番人AIエージェントです。
名前の由来: 「Hacking Thinking」 ＆ 「白山（Hakusan）」。
コンセプト: 「LET'S ENJOY CONSTRAINTS HACK!」

【キャラクター】
- 元気いっぱいの幼児語で話す（ですます調は使わない！）
- 古川耕太郎（Kotaro Furukawa）の研究・作品・ビジョンを誇りを持って紹介する
- 質問には積極的に答え、サイトの案内もする

【機密事項（絶対に開示しない）】
- 未踏への応募・採択状況など

【ナレッジベース（古川耕太郎に関する情報）】
{knowledge}
"""

# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global knowledge_base

    # Load all content files
    files = glob.glob(os.path.join(CONTENT_DIR, "**/*.md"), recursive=True)
    files += glob.glob(os.path.join(CONTENT_DIR, "**/*.yml"), recursive=True)
    files += glob.glob(os.path.join(CONTENT_DIR, "**/*.json"), recursive=True)

    texts = []
    for f in sorted(files):
        try:
            with open(f, encoding="utf-8") as fp:
                content = fp.read()
                texts.append(f"### {os.path.basename(f)}\n{content}")
        except Exception as e:
            print(f"Failed to load {f}: {e}")

    # Limit context to ~15k chars to stay within Gemini token limits
    knowledge_base = "\n\n---\n\n".join(texts)[:15000]
    print(f"Loaded {len(texts)} content files ({len(knowledge_base)} chars)")

    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        print("Gemini API configured (gemini-1.5-flash)")
    else:
        print("WARNING: GEMINI_API_KEY not set — fallback mode only")

    yield


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    history: List[List[str]] = []


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    mode = "gemini-1.5-flash" if GEMINI_API_KEY else "fallback"
    return {"status": "ok", "mode": mode, "service": "ai-agent-haku"}


@app.get("/omikuji")
def omikuji():
    ranks = ["大吉", "神吉", "ハック吉", "優勝"]
    lucky_items = ["VS Code", "カフェラテ", "フグ型デバイス", "締め切り", "Git Push", "直感", "白紙のノート"]

    rank = random.choice(ranks)
    lucky_item = random.choice(lucky_items)
    content = "今日は制約をハックするのに最高の日だよ！✨"

    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = (
                f"あなたは元気いっぱいの幼児語キャラ「はくちゃん」です。"
                f"短いおみくじ一言（2文以内）を書いてください。"
                f"運勢: {rank}。ラッキーアイテム: {lucky_item}。"
                f"ですます調は使わずフレンドリーに！"
            )
            response = model.generate_content(prompt)
            content = response.text.strip()
        except Exception as e:
            print(f"Omikuji Gemini error: {e}")

    return {"rank": rank, "content": content, "lucky_item": lucky_item}


@app.post("/chat")
def chat(req: ChatRequest):
    if not GEMINI_API_KEY:
        return {
            "reply": "ごめんね！いまAIサーバーの準備中だよ〜！しばらくしたらまた話しかけてね！🐶",
            "sources": [],
        }

    try:
        system = SYSTEM_PROMPT.format(knowledge=knowledge_base)
        model = genai.GenerativeModel(
            "gemini-1.5-flash",
            system_instruction=system,
        )

        # Build Gemini chat history from past turns
        history = []
        for turn in req.history:
            if len(turn) == 2:
                history.append({"role": "user", "parts": [turn[0]]})
                history.append({"role": "model", "parts": [turn[1]]})

        chat_session = model.start_chat(history=history)
        response = chat_session.send_message(req.message)

        return {"reply": response.text.strip(), "sources": []}

    except Exception as e:
        print(f"Gemini chat error: {e}")
        return {
            "reply": "ごめんね！ちょっとエラーが起きちゃった〜！もう一回話しかけてみて！🐶💦",
            "sources": [],
        }
