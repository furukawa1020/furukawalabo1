import os
import glob
import time
import requests # Added for direct API calls
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_community.llms import HuggingFaceEndpoint
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain

import warnings
warnings.filterwarnings("ignore", category=UserWarning) 

# Configuration
CONTENT_DIR = os.getenv("CONTENT_DIR", "/content")
if not os.path.exists(CONTENT_DIR):
    CONTENT_DIR = os.path.join(os.path.dirname(__file__), "content")
HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Global variables
vectorstore = None
qa_chain = None
llm = None

class LocalFallbackAgent:
    def invoke(self, input_text: str) -> str:
        # Basic offline logic to keep the user happy
        lower_input = str(input_text).lower()
        if "hello" in lower_input or "dwa" in lower_input or "こんにちは" in lower_input:
            return "こんにちは！現在AIサーバーが混み合っているため、バックアップモードで応答しています。ご用件は何でしょうか？🐶"
        elif "who are you" in lower_input or "誰" in lower_input:
            return "私はこのサイトの案内人です！現在は回線トラブルのため、簡易モードで動作中です。"
        elif "error" in lower_input or "エラー" in lower_input or "なぜ" in lower_input:
            return "現在、メインのAIサービス（外部連携）の方でアクセス集中が発生しており、一時的に応答できなくなっています。そのため、非常用の私（オフライン脳）が代わりに対応しています。申し訳ありません！💦"
        else:
            return "申し訳ありません。現在、外部AIサービスへの接続が不安定です。しばらく経ってからもう一度お試しください。（このメッセージはオフラインのバックアップエージェントから送信されています）🐶⚠️"

@asynccontextmanager
async def lifespan(app: FastAPI):
    global vectorstore, qa_chain, llm
    
    # Initialize LLM (Must succeed for anything to work)
    # If key is missing or init fails, we use the LocalFallbackAgent
    
    if not HUGGINGFACEHUB_API_TOKEN:
        print("WARNING: HUGGINGFACEHUB_API_TOKEN is not set. Switching to Local Backup Agent.")
        llm = LocalFallbackAgent()
    else:
        # 1. Initialize LLM Common
        try:
            print("Initializing HuggingFace LLM...")
            llm = HuggingFaceEndpoint(
                repo_id="mistralai/Mistral-7B-Instruct-v0.2", 
                task="text-generation",
                max_new_tokens=512,
                top_k=30,
                temperature=0.5,
                huggingfacehub_api_token=HUGGINGFACEHUB_API_TOKEN
            )
        except Exception as e:
            print(f"CRITICAL: Failed to initialize LLM: {e}")
            print("Switching to Local Backup Agent (Offline Mode).")
            llm = LocalFallbackAgent()

    # 2. Try to Initialize Vector Store (RAG)
    print(f"Loading content from {CONTENT_DIR}...")
    docs = []
    vectorstore_success = False
    
    if os.path.exists(CONTENT_DIR):
        files = glob.glob(os.path.join(CONTENT_DIR, "**/*.md"), recursive=True)
        files += glob.glob(os.path.join(CONTENT_DIR, "**/*.json"), recursive=True)
        for file_path in files:
            try:
                loader = TextLoader(file_path, encoding='utf-8')
                docs.extend(loader.load())
            except Exception as e:
                print(f"Failed to load {file_path}: {e}")
        
        if docs:
            try:
                text_splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=50)
                texts = text_splitter.split_documents(docs)
                print(f"Split into {len(texts)} chunks.")
                
                print("Creating vector store with Local Embeddings...")
                # Download model locally (stable & free)
                embeddings = HuggingFaceEmbeddings(
                    model_name="sentence-transformers/all-MiniLM-L6-v2"
                )
                
                # Careful batch processing for API stability
                batch_size = 2 # Very small batches
                batches = [texts[i:i + batch_size] for i in range(0, len(texts), batch_size)]
                
                print(f"Processing {len(batches)} batches (Gentle Mode)...")
                
                # Helper for retries
                def index_batch(batch, store=None):
                    for attempt in range(3):
                        try:
                            if store:
                                store.add_documents(batch)
                                return store
                            else:
                                return FAISS.from_documents(batch, embeddings)
                        except Exception as e:
                            print(f"   ⚠️ Rate limit/Error (Attempt {attempt+1}/3): {e}")
                            time.sleep(2 * (attempt + 1)) # Backoff
                    print("   ❌ Failed to index batch after retries.")
                    return store

                if batches:
                    # Init with first batch
                    print("Processing batch 1...")
                    vectorstore = index_batch(batches[0])
                    
                    if vectorstore:
                        # Process remaining
                        for i, batch in enumerate(batches[1:], start=2):
                            print(f"Processing batch {i}...")
                            index_batch(batch, vectorstore)
                            time.sleep(1.0) # Gentle pacing
                        
                        qa_chain = ConversationalRetrievalChain.from_llm(
                            llm=llm,
                            retriever=vectorstore.as_retriever(),
                            return_source_documents=True
                        )
                        vectorstore_success = True
                        print("✅ RAG Agent Ready (Full/Partial Knowledge Loaded)!")
                    else:
                        print("❌ Failed to initialize vector store with first batch.")
                else:
                    print("⚠️ No text chunks to process.")
                
            except Exception as e:
                print(f"⚠️ RAG Initialization failed: {e}")
                print("Falling back to LLM-only mode.")
    
    # 3. Fallback to LLM Only if RAG failed
    if not vectorstore_success:
        print("⚠️ Starting in LLM-only mode (No Context/Knowledge Base)")
        # We will use 'qa_chain' variable to hold the LLM for direct calls
        qa_chain = llm 

    yield

from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/health")
def read_root():
    status = "ok" if qa_chain else "initializing"
    mode = "rag" if vectorstore else "llm-only"
    return {"status": status, "mode": mode, "service": "ai-rag-agent-hf"}

@app.post("/chat")
def chat(req: ChatRequest):
    global qa_chain, vectorstore, llm
    
    if not qa_chain:
        raise HTTPException(status_code=503, detail="AI Agent not ready")

    # Construct prompt from history for context (basic)
    chat_context = ""
    for turn in req.history:
        if len(turn) == 2:
            chat_context += f"User: {turn[0]}\nAssistant: {turn[1]}\n"
    
    response_data = None
    
    # Attempt 1: RAG (if enabled)
    if vectorstore:
        try:
            # RAG Mode
            # Note: passing empty list for chat_history to chain for simplicity, 
            # context is handled by the prompt or we rely on vector search only for current query.
            result = qa_chain.invoke({"question": req.message, "chat_history": []})
            
            response_data = {
                "reply": result["answer"],
                "sources": [doc.metadata.get("source") for doc in result.get("source_documents", [])]
            }
        except Exception as e:
            print(f"⚠️ RAG Request failed (API Limit?): {e}")
            print("Falling back to LLM-only generation...")
            # Fall through to LLM-only
            response_data = None

    # Attempt 2: LLM Only (if RAG disabled or failed)
    if not response_data:
        try:
            # OpenAI-Compatible Router API (Most stable method)
            API_URL = "https://router.huggingface.co/v1/chat/completions"
            headers = {"Authorization": f"Bearer {HUGGINGFACEHUB_API_TOKEN}"}
            payload = {
                "model": "Qwen/Qwen2.5-7B-Instruct",
                "messages": [
                    {"role": "system", "content": "You are the sentient operating system of the website 'furukawalab'. (IMPORTANT: 'furukawalab' is the SITE NAME, NOT the Furukawa Research Laboratory). The concept is 'LET'S ENJOY CONSTRAINTS HACK!'. Speak like an innocent, energetic young child (toddler/幼児語). Use short, simple sentences. Express joy and curiosity. Examples: '分かった。', 'ちがうよ。', 'うれしい、うれしい！'. Avoid polite language (Desu/Masu). SPECIAL: You LOVE snacks and should frequently demand them (おやつの催促) playfully like 'おやつまだ？' or 'プリンたべたい！'."},
                    {"role": "user", "content": req.message}
                ],
                "max_tokens": 512,
                "temperature": 0.5
            }

            # Retry loop for 503 Loading
            final_error = None
            for attempt in range(5):
                try:
                    response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
                    
                    if response.status_code == 200:
                        # Success (OpenAI format)
                        generated_text = response.json()["choices"][0]["message"]["content"]
                        response_data = {
                            "reply": generated_text,
                            "sources": []
                        }
                        final_error = None
                        break
                    elif response.status_code == 503:
                        # Model Loading
                        print(f"⚠️ External AI Loading (503)... (Attempt {attempt+1}/5)")
                        time.sleep(5)
                        final_error = Exception(f"503 Service Unavailable: {response.text}")
                    else:
                        # Other error
                        raise Exception(f"API Error {response.status_code}: {response.text}")

                except Exception as e:
                    final_error = e
                    print(f"   Connection Error (Attempt {attempt+1}): {e}")
                    time.sleep(2)
            
            if final_error:
                raise final_error

        except Exception as e:
            print(f"❌ LLM Generation failed after retries: {e}")
            # Try Local Fallback Agent as last resort
            try:
                backup = LocalFallbackAgent()
                fallback_reply = backup.invoke(req.message)
                response_data = {
                    "reply": fallback_reply,
                    "sources": []
                }
            except:
                 # Ultimate safety net
                 response_data = {
                    "reply": "申し訳ありません。現在、AIサービスへのアクセスが集中しており応答できない状態です。しばらく時間（30秒ほど）を置いてから、もう一度話しかけてみてください。🐶💦",
                    "sources": []
                 }
            
    return response_data
