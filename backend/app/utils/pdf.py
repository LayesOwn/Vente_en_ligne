from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import io


# Palette de couleurs DASHA SHOP
ROSE_POWDER = colors.HexColor("#F4B8C1")
BEIGE = colors.HexColor("#F5F0E8")
BLACK_ELEGANT = colors.HexColor("#1A1A1A")
GRAY_LIGHT = colors.HexColor("#F9F9F9")
GRAY_MEDIUM = colors.HexColor("#E0E0E0")


def generate_invoice_pdf(order) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # Style personnalisés
    title_style = ParagraphStyle(
        "DashaTitle",
        parent=styles["Heading1"],
        fontSize=28,
        textColor=BLACK_ELEGANT,
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "DashaSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=ROSE_POWDER,
        alignment=TA_CENTER,
        fontName="Helvetica",
        spaceAfter=20,
    )
    section_title_style = ParagraphStyle(
        "SectionTitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=BLACK_ELEGANT,
        fontName="Helvetica-Bold",
        spaceAfter=6,
    )
    normal_style = ParagraphStyle(
        "DashaNormal",
        parent=styles["Normal"],
        fontSize=10,
        textColor=BLACK_ELEGANT,
        fontName="Helvetica",
    )
    total_style = ParagraphStyle(
        "DashaTotal",
        parent=styles["Normal"],
        fontSize=14,
        textColor=BLACK_ELEGANT,
        fontName="Helvetica-Bold",
        alignment=TA_RIGHT,
    )
    footer_style = ParagraphStyle(
        "DashaFooter",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.gray,
        alignment=TA_CENTER,
        fontName="Helvetica",
    )

    # ── En-tête ────────────────────────────────────────────────────────────────
    elements.append(Paragraph("DASHA SHOP", title_style))
    elements.append(Paragraph("Mode Féminine & Accessoires de Luxe", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=ROSE_POWDER))
    elements.append(Spacer(1, 0.5 * cm))

    # ── Numéro de facture ──────────────────────────────────────────────────────
    invoice_data = [
        ["FACTURE", f"N° DASHA-{order.id:04d}"],
        ["Date", order.created_at.strftime("%d/%m/%Y à %H:%M")],
        ["Statut paiement", _payment_label(order.payment_method)],
        ["Statut commande", _status_label(order.status)],
    ]
    invoice_table = Table(invoice_data, colWidths=[5 * cm, 10 * cm])
    invoice_table.setStyle(
        TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("TEXTCOLOR", (0, 0), (-1, -1), BLACK_ELEGANT),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
        ])
    )
    elements.append(invoice_table)
    elements.append(Spacer(1, 0.5 * cm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_MEDIUM))
    elements.append(Spacer(1, 0.5 * cm))

    # ── Informations client ────────────────────────────────────────────────────
    elements.append(Paragraph("INFORMATIONS CLIENT", section_title_style))
    client_data = [
        ["Nom", order.customer_name],
        ["Téléphone", order.phone],
        ["Ville de livraison", order.city],
    ]
    client_table = Table(client_data, colWidths=[5 * cm, 12 * cm])
    client_table.setStyle(
        TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("TEXTCOLOR", (0, 0), (-1, -1), BLACK_ELEGANT),
            ("BACKGROUND", (0, 0), (-1, -1), GRAY_LIGHT),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [GRAY_LIGHT, colors.white]),
        ])
    )
    elements.append(client_table)
    elements.append(Spacer(1, 0.5 * cm))

    # ── Articles commandés ─────────────────────────────────────────────────────
    elements.append(Paragraph("ARTICLES COMMANDÉS", section_title_style))

    items_header = [["Produit", "Qté", "Prix unitaire", "Sous-total"]]
    items_data = []

    for item in order.items:
        product_name = item.product.name if item.product else f"Produit #{item.product_id}"
        subtotal = item.quantity * item.price
        items_data.append([
            product_name,
            str(item.quantity),
            f"{item.price:,.0f} FCFA",
            f"{subtotal:,.0f} FCFA",
        ])

    table_data = items_header + items_data
    items_table = Table(table_data, colWidths=[8 * cm, 2 * cm, 4 * cm, 4 * cm])
    items_table.setStyle(
        TableStyle([
            # En-tête
            ("BACKGROUND", (0, 0), (-1, 0), BLACK_ELEGANT),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),
            ("ALIGN", (0, 0), (-1, 0), "CENTER"),
            # Données
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 10),
            ("TEXTCOLOR", (0, 1), (-1, -1), BLACK_ELEGANT),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BEIGE]),
            # Bordures
            ("GRID", (0, 0), (-1, -1), 0.5, GRAY_MEDIUM),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    elements.append(items_table)
    elements.append(Spacer(1, 0.5 * cm))

    # ── Total ──────────────────────────────────────────────────────────────────
    elements.append(HRFlowable(width="100%", thickness=1, color=ROSE_POWDER))
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(Paragraph(f"TOTAL : {order.total:,.0f} FCFA", total_style))
    elements.append(Spacer(1, 1 * cm))

    # ── Pied de page ──────────────────────────────────────────────────────────
    elements.append(HRFlowable(width="100%", thickness=0.5, color=GRAY_MEDIUM))
    elements.append(Spacer(1, 0.3 * cm))
    elements.append(Paragraph(
        "Merci pour votre confiance — DASHA SHOP | Mode Féminine & Accessoires de Luxe",
        footer_style,
    ))

    doc.build(elements)
    return buffer.getvalue()


def _payment_label(method: str) -> str:
    labels = {
        "wave": "Wave",
        "orange_money": "Orange Money",
        "livraison": "Paiement à la livraison",
    }
    return labels.get(method, method)


def _status_label(status: str) -> str:
    labels = {
        "en_attente": "En attente",
        "confirmee": "Confirmée",
        "en_livraison": "En livraison",
        "livree": "Livrée",
        "annulee": "Annulée",
    }
    return labels.get(status, status)
