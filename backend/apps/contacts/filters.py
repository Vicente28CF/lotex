import re

# Patrones que indican intento de bypass de la plataforma
PHONE_PATTERN    = re.compile(r'(\+?[\d\s\-().]{7,})')
EMAIL_PATTERN    = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
WHATSAPP_PATTERN = re.compile(r'(whatsapp|wha\.ts|wa\.me|whatsa)', re.IGNORECASE)
TELEGRAM_PATTERN = re.compile(r'(telegram|t\.me|@\w+)', re.IGNORECASE)
SOCIAL_PATTERN   = re.compile(r'(facebook|instagram|tiktok|fb\.com)', re.IGNORECASE)

BLOCKED_WORDS = [
    "número", "numero", "celular", "cel", "llámame", "llamame",
    "escríbeme", "escribeme", "contactame", "contáctame",
]

def scan_message(body: str) -> tuple[bool, str]:
    """
    Retorna (is_flagged, reason).
    No bloquea el mensaje — lo marca para revisión.
    """
    if PHONE_PATTERN.search(body):
        return True, "Posible número de teléfono detectado"
    if EMAIL_PATTERN.search(body):
        return True, "Posible email detectado"
    if WHATSAPP_PATTERN.search(body):
        return True, "Mención de WhatsApp detectada"
    if TELEGRAM_PATTERN.search(body):
        return True, "Mención de Telegram detectada"
    if SOCIAL_PATTERN.search(body):
        return True, "Mención de red social detectada"

    body_lower = body.lower()
    for word in BLOCKED_WORDS:
        if word in body_lower:
            return True, f"Palabra restringida: '{word}'"

    return False, ""
