import os
import glob
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEndpoint
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain

# Configuration
CONTENT_DIR = os.getenv("CONTENT_DIR", "/content")
HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Global variables
vectorstore = None
qa_chain = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global vectorstore, qa_chain
    
    if not HUGGINGFACEHUB_API_TOKEN:
        print("WARNING: HUGGINGFACEHUB_API_TOKEN is not set. AI features will fail.")
    else:
        print(f"Loading content from {CONTENT_DIR}...")
        docs = []
        if os.path.exists(CONTENT_DIR):
            files = glob.glob(os.path.join(CONTENT_DIR, "**/*.md"), recursive=True)
            files += glob.glob(os.path.join(CONTENT_DIR, "**/*.json"), recursive=True)
            
            print(f"Found {len(files)} files.")
            for file_path in files:
                try:
                    loader = TextLoader(file_path, encoding='utf-8')
                    docs.extend(loader.load())
                except Exception as e:
                    print(f"Failed to load {file_path}: {e}")
            
            if docs:
                text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
                texts = text_splitter.split_documents(docs)
                
                print("Creating vector store with HuggingFace Inference API (Cloud Embeddings)...")
                # Use Cloud API instead of local processing to save memory
                embeddings = HuggingFaceInferenceAPIEmbeddings(
                    api_key=HUGGINGFACEHUB_API_TOKEN,
                    model_name="sentence-transformers/all-MiniLM-L6-v2"
                )
                vectorstore = Chroma.from_documents(texts, embeddings)
                
                print("Initializing HuggingFace LLM...")
                # Use Mistral-7B or similar via Inference API
                llm = HuggingFaceEndpoint(
                    repo_id="mistralai/Mistral-7B-Instruct-v0.2", 
                    task="text-generation",
                    max_new_tokens=512,
                    top_k=30,
                    temperature=0.5,
                    huggingfacehub_api_token=HUGGINGFACEHUB_API_TOKEN
                )
                
                qa_chain = ConversationalRetrievalChain.from_llm(
                    llm=llm,
                    retriever=vectorstore.as_retriever(),
                    return_source_documents=True
                )
                print("✅ AI Agent Ready (Hugging Face Powered)!")
            else:
                print("⚠️ No documents found to index.")
        else:
            print(f"⚠️ Content directory {CONTENT_DIR} not found.")
            
    yield

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for simplicity in this dev/demo setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: List[List[str]] = [] 

@app.get("/health")
def read_root():
    return {"status": "ok", "service": "ai-rag-agent-hf"}

@app.post("/chat")
def chat(req: ChatRequest):
    global qa_chain
    
    if not qa_chain:
        raise HTTPException(status_code=503, detail="AI Agent not initialized (Check Token)")

    chat_history = []
    for turn in req.history:
        if len(turn) == 2:
            chat_history.append((turn[0], turn[1]))

    result = qa_chain({"question": req.message, "chat_history": chat_history})
    
    return {
        "reply": result["answer"],
        "sources": [doc.metadata.get("source") for doc in result.get("source_documents", [])]
    }
