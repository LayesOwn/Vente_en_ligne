import os
import httpx
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")


async def send_order_notification(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(url, json={
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML",
            })
    except Exception:
        pass


def build_order_message(order) -> str:
    payment_labels = {
        "wave": "Wave",
        "orange_money": "Orange Money",
        "livraison": "Paiement a la livraison",
    }
    payment = payment_labels.get(order.payment_method, order.payment_method)

    items_lines = []
    for item in order.items:
        name = item.product.name if item.product else f"Produit #{item.product_id}"
        items_lines.append(f"  - {name} x{item.quantity}  {item.price:,.0f} FCFA")
    items_text = "\n".join(items_lines)

    return (
        f"Nouvelle commande DASHA SHOP\n\n"
        f"Commande N DASHA-{order.id:04d}\n\n"
        f"Client\n"
        f"  Nom : {order.customer_name}\n"
        f"  Tel : {order.phone}\n"
        f"  Ville : {order.city}\n\n"
        f"Articles\n{items_text}\n\n"
        f"Paiement : {payment}\n"
        f"Total : {order.total:,.0f} FCFA"
    )
