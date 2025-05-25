from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from together import Together
from together.error import RateLimitError
import asyncio

app = FastAPI()
client = Together(api_key="86346bfda084ee6c73bc164752b6c9962cacd0c0a31e7e1ea31cd3609a901b2c")

class RecommendationRequest(BaseModel):
    company_name: str
    use_case: str

async def fetch_recommendation(messages, max_retries: int = 5):
    """
    Attempt to fetch a recommendation stream with exponential backoff on rate limits.
    """
    delay = 1
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model="meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
                messages=messages,
                stream=True
            )
        except RateLimitError:
            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
                delay *= 2
            else:
                raise

@app.post("/recommend_model")
async def recommend_model(req: RecommendationRequest):
    system_prompt = (
        """
We are an AI provider.  
You’ll receive a form with two fields where our user describes:
1) Company name  
2) Use case (what they need in their company)  

After that, you’ll pick the single best model from our inventory:
models = [Object detection, gun, fire, face recognition, violence detection, crash detection]

Focus primarily on the company name, but analyze the use case carefully.  
Respond with exactly one word (no explanation): the best model.
"""
    )

    user_message = (
        f"Company Name : {req.company_name}\n"
        f"Use Case : {req.use_case}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]

    try:
        response_stream = await fetch_recommendation(messages)
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded, please try again later.")

    # collect the streamed tokens into one string
    result = []
    for token in response_stream:
        if hasattr(token, "choices") and token.choices:
            delta = token.choices[0].delta.content
            if delta:
                result.append(delta)

    model_choice = "".join(result).strip()
    if not model_choice:
        raise HTTPException(status_code=500, detail="Failed to retrieve a model recommendation.")

    return {"recommended_model": model_choice}

# To run this service:
# uvicorn recommended_model:app --reload --host 0.0.0.0 --port 8000
