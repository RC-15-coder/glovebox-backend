import os
import sys
import logging
logging.getLogger("pypdf").setLevel(logging.ERROR)
from dotenv import load_dotenv
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone

load_dotenv()

def ingest_manual(pdf_path: str, car_model: str, chunk_size: int = 1000, chunk_overlap: int = 200):
    print(f"Loading manual from: {pdf_path}...")
    
    # 1. Load PDF
    loader = PyMuPDFLoader(pdf_path)
    documents = loader.load()
    print(f"Loaded {len(documents)} pages.")

    # 2. Add car model to metadata
    for doc in documents:
        doc.metadata["car_model"] = car_model

    # 3. Chunk the text
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunks.")

    # 4. Load embedding model
    print("Loading embedding model...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # 5. Push to Pinecone
    print("Pushing embeddings to Pinecone...")
    vector_store = PineconeVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        index_name="glovebox-manuals",
        namespace=car_model
    )
    
    print(f"\n✅ Successfully ingested {len(chunks)} chunks into Pinecone!")
    print(f"Namespace: {car_model}")
    return vector_store

if __name__ == "__main__":
    # List of our 4 new cars: (file_path, car_model_namespace)
    new_manuals = [
        ("data/manuals/toyota_camry_2024.pdf", "toyota_camry_2024"),
        ("data/manuals/ford_f150_2023.pdf", "ford_f150_2023"),
        ("data/manuals/tesla_model3_2024.pdf", "tesla_model3_2024"),
        ("data/manuals/jeep_wrangler_2024.pdf", "jeep_wrangler_2024")
    ]

    print("Starting batch ingestion to Pinecone...")

    for pdf_path, car_model in new_manuals:
        # Check if the file actually exists in the folder before trying to upload
        if os.path.exists(pdf_path):
            print(f"\n🚀 Starting ingestion for: {car_model}...")
            
            # Call your existing ingestion function 
            ingest_manual(pdf_path=pdf_path, car_model=car_model)
            
            print(f"✅ Finished uploading {car_model}!")
        else:
            print(f"⚠️ WARNING: Skipping {car_model} — Could not find the file at {pdf_path}. Please check the spelling.")
            
    print("\n🎉 Batch upload complete!")