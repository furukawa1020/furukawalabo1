import os
import glob
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_community.llms import HuggingFaceEndpoint
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain

# Configuration
CONTENT_DIR = os.getenv("CONTENT_DIR", "/content")
HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Global variables
vectorstore = None
qa_chain = None
llm = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global vectorstore, qa_chain, llm
    
    # Initialize LLM (Must succeed for anything to work)
    if not HUGGINGFACEHUB_API_TOKEN:
        print("WARNING: HUGGINGFACEHUB_API_TOKEN is not set. AI Features will fail.")
        yield
        return

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
        yield
        return

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
                
                print("Creating vector store with HuggingFace Inference API...")
                embeddings = HuggingFaceInferenceAPIEmbeddings(
                    api_key=HUGGINGFACEHUB_API_TOKEN,
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
            # Check global LLM (Must be present if server started)
            if not llm:
                # Should not happen if lifespan logic is correct, but safety first
                raise Exception("LLM instance is missing!")
            
            prompt = f"<s>[INST] You are a helpful assistant. \nHistory:\n{chat_context}\nUser: {req.message} [/INST]"
            
            # Use invoke for string-in string-out
            response = llm.invoke(prompt)
            
            response_data = {
                "reply": response,
                "sources": []
            }
        except Exception as e:
            print(f"❌ LLM Generation failed: {e}")
            # Instead of crashing, return a polite error message
            response_data = {
                "reply": "申し訳ありません。現在、AIサービスへのアクセスが集中しており応答できない状態です。しばらく時間（30秒ほど）を置いてから、もう一度話しかけてみてください。🐶💦",
                "sources": []
            }
            
    return response_data
