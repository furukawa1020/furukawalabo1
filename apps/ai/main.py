import os
import glob
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

@asynccontextmanager
async def lifespan(app: FastAPI):
    global vectorstore, qa_chain
    
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
                text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
                texts = text_splitter.split_documents(docs)
                
                print("Creating vector store with HuggingFace Inference API...")
                embeddings = HuggingFaceInferenceAPIEmbeddings(
                    api_key=HUGGINGFACEHUB_API_TOKEN,
                    model_name="sentence-transformers/all-MiniLM-L6-v2"
                )
                vectorstore = FAISS.from_documents(texts, embeddings)
                print("✅ Vector store created successfully!")
                
                qa_chain = ConversationalRetrievalChain.from_llm(
                    llm=llm,
                    retriever=vectorstore.as_retriever(),
                    return_source_documents=True
                )
                vectorstore_success = True
                print("✅ RAG Agent Ready!")
                
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
    global qa_chain, vectorstore
    
    if not qa_chain:
        raise HTTPException(status_code=503, detail="AI Agent not ready")

    # Construct prompt from history for context (basic)
    chat_context = ""
    for turn in req.history:
        if len(turn) == 2:
            chat_context += f"User: {turn[0]}\nAssistant: {turn[1]}\n"
    
    try:
        if vectorstore:
            # RAG Mode
            result = qa_chain({"question": req.message, "chat_history": []}) # Use empty hist list for chain, context managed inside? or pass list.
            # Mistral Instruct might handle history better in the prompt, but chain handles it.
            # Convert list of lists to list of tuples for LangChain if needed, but here we just pass simplified.
            # Actually ConversationalRetrievalChain expects specific format. 
            # Simple fix: Let's pass empty history to chain for now to avoid format errors, rely on vector search.
            
            return {
                "reply": result["answer"],
                "sources": [doc.metadata.get("source") for doc in result.get("source_documents", [])]
            }
        else:
            # LLM Only Mode
            # Manually construct prompt
            prompt = f"<s>[INST] You are a helpful assistant. \nHistory:\n{chat_context}\nUser: {req.message} [/INST]"
            response = qa_chain.invoke(prompt) # qa_chain is llm object here
            return {
                "reply": response,
                "sources": []
            }
    except Exception as e:
        print(f"Error during generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
