from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

app = FastAPI(title="StyleCart AI Service", version="1.0.0")

class Product(BaseModel):
    id: str
    name: str
    description: str = ""
    category: str = ""
    tags: List[str] = []
    price: float = 0
    image: str = ""
    stock: int = 0

class RecommendationRequest(BaseModel):
    products: List[Product]
    history: List[Product] = []
    limit: int = 6

class SearchRequest(BaseModel):
    products: List[Product]
    query: str
    limit: int = 12

def text(p: Product):
    return " ".join([p.name, p.description, p.category, " ".join(p.tags)]).lower()

@app.get("/health")
def health():
    return {"status":"ok","service":"stylecart-ai"}

@app.post("/recommend")
def recommend(req: RecommendationRequest):
    if not req.products:
        return {"recommendations":[]}
    corpus=[text(p) for p in req.products]
    vectorizer=TfidfVectorizer(stop_words="english", ngram_range=(1,2))
    matrix=vectorizer.fit_transform(corpus)
    if req.history:
        hist=set(str(p.id) for p in req.history)
        idx=[i for i,p in enumerate(req.products) if str(p.id) in hist]
        profile=matrix[idx].mean(axis=0) if idx else matrix.mean(axis=0)
    else:
        profile=matrix.mean(axis=0)
    scores=cosine_similarity(profile, matrix).flatten()
    ranked=sorted(range(len(req.products)), key=lambda i:scores[i], reverse=True)
    out=[]
    for i in ranked:
        if req.history and str(req.products[i].id) in {str(p.id) for p in req.history}:
            continue
        out.append({"product":req.products[i].model_dump(),"score":round(float(scores[i]),4)})
        if len(out)>=req.limit: break
    return {"recommendations":out,"method":"TF-IDF + cosine similarity"}

def parse_query(q):
    ql=q.lower()
    budget=None
    m=re.search(r'(?:under|below|less than|upto|up to|under rs\.?|under ₹)\s*₹?\s*([\d,]+)', ql)
    if m: budget=int(m.group(1).replace(",",""))
    colors=[c for c in ["black","white","blue","red","green","pink","brown","grey","gray"] if c in ql]
    purpose=None
    for p in ["running","gym","party","college","office","formal","casual","winter","travel","yoga","sports"]:
        if p in ql: purpose=p
    category=None
    for c in ["shoes","footwear","shirt","t-shirt","jeans","dress","hoodie","accessories","sportswear","kids","women","men"]:
        if c in ql: category=c
    return {"budget":budget,"colors":colors,"purpose":purpose,"category":category}

@app.post("/search")
def search(req: SearchRequest):
    intent=parse_query(req.query)
    vectorizer=TfidfVectorizer(stop_words="english", ngram_range=(1,2))
    corpus=[text(p) for p in req.products]+[req.query.lower()]
    matrix=vectorizer.fit_transform(corpus)
    scores=cosine_similarity(matrix[-1],matrix[:-1]).flatten()
    ranked=sorted(range(len(req.products)),key=lambda i:scores[i],reverse=True)
    out=[]
    for i in ranked:
        p=req.products[i]
        blob=text(p)
        if intent["budget"] is not None:
            # Price is not part of the AI service model; caller may filter separately.
            pass
        bonus=0
        if intent["purpose"] and intent["purpose"] in blob: bonus += .25
        if intent["category"] and intent["category"].rstrip("s") in blob: bonus += .15
        if any(c in blob for c in intent["colors"]): bonus += .15
        out.append({"product":p.model_dump(),"score":round(float(scores[i]+bonus),4)})
    out.sort(key=lambda x:x["score"],reverse=True)
    return {"intent":intent,"results":out[:req.limit],"method":"TF-IDF semantic ranking"}
