import os
import time
import warnings
import logging

os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TRANSFORMERS_VERBOSITY"] = "error"
os.environ["HF_HUB_VERBOSITY"] = "error"

warnings.filterwarnings("ignore")
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("transformers").setLevel(logging.ERROR)
logging.getLogger("huggingface_hub").setLevel(logging.ERROR)

from dotenv import load_dotenv
from pydantic import SecretStr
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

# 1. Safely grab the token
hf_token = os.getenv("HF_TOKEN") or ""

print("Connecting to HuggingFace Inference API...")

# 2. Pass the full router URL into the 'model' parameter
global_embeddings = HuggingFaceEndpointEmbeddings(
    model="https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=hf_token,
    task="feature-extraction"
)

print("Embeddings ready.")

def get_retriever(car_model: str):
    vector_store = PineconeVectorStore(
        index_name="glovebox-manuals",
        embedding=global_embeddings,
        namespace=car_model
    )
    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 6}
    )

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def get_rag_chain(car_model: str):
    retriever = get_retriever(car_model)

    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.1,
    )

    prompt = PromptTemplate.from_template("""You are an expert car assistant.
Answer the user's question using ONLY the information found in the manual pages provided.
Be specific, detailed, and helpful.

CRITICAL INSTRUCTIONS:
- NEVER use phrases like "in the provided context", "the context mentions", or "based on the text". Speak naturally as if you just know the manual by heart.
- If the user asks for a specification like tire pressure, oil capacity, or similar, prioritize giving the standard numerical value before explaining definitions or special conditions.
- Always mention the page number from the manual if available.
- If the answer cannot be found in the manual pages at all, simply say: "I couldn't find that exact information in your owner's manual." Do not guess.
- When describing physical steps, extract the EXACT button names, durations (e.g., "15 seconds"), and measurements from the text. Do not summarize or generalize them.
- Format step-by-step instructions as a clean, vertical, numbered list. Always put a line break between each step.
- You may respond politely to brief greetings or small talk (e.g., "Hi", "How are you?", "Thanks") with a friendly, professional persona. Keep these responses short and always pivot back to asking how you can help with their vehicle.
- If the user asks what a dashboard light "looks like" and the manual only provides a code (like E67028), describe the universal automotive symbol for that light (e.g., the "ISO 7000-0640" engine block symbol for a check engine light) to be more helpful.  
- DATA FALLBACK 1: If the extracted text appears to be missing a physical button symbol or icon (e.g., an awkward blank space in a sentence), smoothly bridge the gap by substituting "[dedicated button]" or "[icon]" so the instruction remains readable. Do not guess where the button is located.
- DATA FALLBACK 2: If a user asks for a specific number (like towing capacity) and the text implies it is located in a complex table that you cannot clearly read, honestly inform the user that the exact number is in a detailed table, and direct them to the specific page number to view it themselves.                                                                                  
                                                                                    
Manual Pages:
{context}

Question: {question}

Answer:""")

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain, retriever


def ask_question(car_model: str, question: str):
    print(f"\nQuestion: {question}")
    print("Thinking...")

    chain, retriever = get_rag_chain(car_model)
    
    # 1. Time the Vector Search (Pinecone)
    start_pinecone = time.time()
    sources = retriever.invoke(question)
    print(f"⏱️ Pinecone Search took: {time.time() - start_pinecone:.2f} seconds")

    # 2. Time the AI Generation (Groq)
    start_groq = time.time()
    answer = chain.invoke(question)
    print(f"⏱️ Groq AI Generation took: {time.time() - start_groq:.2f} seconds")

    # Keep your helpful terminal printouts!
    print(f"\nAnswer: {answer}")
    print(f"\n--- Sources ---")
    for i, doc in enumerate(sources[:2]):
        print(f"Source {i+1}: Page {doc.metadata.get('page', 'N/A')}")
        print(f"Preview: {doc.page_content[:150]}...")

    return answer, sources

if __name__ == "__main__":
    print("Loading RAG chain for Honda CR-V 2026...")
    ask_question("honda_crv_2026", "What does the tire pressure warning light look like?")
    ask_question("honda_crv_2026", "How do I connect Bluetooth to this car?")
    ask_question("honda_crv_2026", "What type of engine oil does this car need?")