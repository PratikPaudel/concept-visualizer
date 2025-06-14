from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "Backend is live 🔥"}


async def keep_alive():
    """Background task to ping Render server and keep it awake."""
    url = "https://concept-visualizer-z8xl.onrender.com"
    async with httpx.AsyncClient() as client:
        while True:
            try:
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                logger.info(f"⏰ Keep-alive ping at: {current_time} -> {url}")

                response = await client.get(url)
                if response.status_code == 200:
                    logger.info("✅ Keep-alive ping successful")
                else:
                    logger.warning(f"⚠️ Received status code: {response.status_code}")

                # Wait 14 minutes before the next ping
                await asyncio.sleep(14 * 60)
            except Exception as e:
                logger.error(f"❌ Ping failed: {str(e)}")
                await asyncio.sleep(30)


@app.on_event("startup")
async def on_startup():
    asyncio.create_task(keep_alive())
