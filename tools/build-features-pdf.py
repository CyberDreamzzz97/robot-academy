#!/usr/bin/env python3
"""
Regenerate docs/FEATURES.pdf from FEATURES.md.

FEATURES.md is the source of truth and stays diffable in git; the PDF is the
readable artefact. Run this at every milestone:

    python tools/build-features-pdf.py

Requires: reportlab  (pip install reportlab)
"""
import os
import re
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                               Spacer, Table, TableStyle, KeepTogether)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'FEATURES.md')
OUT = os.path.join(ROOT, 'docs', 'FEATURES.pdf')

INK = colors.HexColor('#16202c')
DIM = colors.HexColor('#5b6b7b')
RULE = colors.HexColor('#d3dae2')
ACCENT = colors.HexColor('#2f6fd0')
BAND = colors.HexColor('#eef2f7')

STATUS = {
    'SHIPPED': colors.HexColor('#0d7250'),
    'PARTIAL': colors.HexColor('#b06a10'),
    'PLANNED': colors.HexColor('#5b6b7b'),
}


def styles():
    ss = getSampleStyleSheet()
    return {
        'h1': ParagraphStyle('h1', parent=ss['Title'], fontName='Helvetica-Bold',
                             fontSize=24, leading=28, textColor=INK,
                             alignment=TA_LEFT, spaceAfter=2),
        'sub': ParagraphStyle('sub', fontName='Helvetica', fontSize=10,
                              leading=14, textColor=DIM, spaceAfter=14),
        'h2': ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=15,
                             leading=19, textColor=INK, spaceBefore=16, spaceAfter=6),
        'h3': ParagraphStyle('h3', fontName='Helvetica-Bold', fontSize=11,
                             leading=15, textColor=ACCENT, spaceBefore=12, spaceAfter=5),
        'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.5,
                               leading=13.5, textColor=INK, spaceAfter=6),
        'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.5,
                                 leading=13.5, textColor=INK, leftIndent=10,
                                 bulletIndent=2, spaceAfter=3),
        'cell': ParagraphStyle('cell', fontName='Helvetica', fontSize=8.4,
                               leading=11.4, textColor=INK),
        'cellmono': ParagraphStyle('cellmono', fontName='Courier', fontSize=7.6,
                                   leading=10.4, textColor=DIM),
        'head': ParagraphStyle('head', fontName='Helvetica-Bold', fontSize=7.6,
                               leading=10, textColor=DIM),
    }


def inline(text):
    """Convert the small subset of markdown used in FEATURES.md to RML."""
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`(.+?)`', r'<font face="Courier" size="8">\1</font>', text)
    text = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<i>\1</i>', text)
    return text


def parse_rows(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]


def build_table(header, rows, S, avail):
    ncols = len(header)
    # status column gets a fixed narrow width; first column narrow; rest share
    if ncols == 4 and header[2].lower() == 'status':
        widths = [avail * 0.09, avail * 0.47, avail * 0.13, avail * 0.31]
    elif ncols == 4:
        widths = [avail * 0.12, avail * 0.25, avail * 0.22, avail * 0.41]
    elif ncols == 3:
        widths = [avail * 0.22, avail * 0.36, avail * 0.42]
    elif ncols == 2:
        widths = [avail * 0.68, avail * 0.32]
    else:
        widths = [avail / ncols] * ncols

    data = [[Paragraph(inline(h).upper(), S['head']) for h in header]]
    status_cells = []
    for r_i, row in enumerate(rows, start=1):
        out = []
        for c_i, cell in enumerate(row):
            plain = re.sub(r'[`*]', '', cell).strip()
            if plain in STATUS:
                status_cells.append((c_i, r_i, plain))
                st = ParagraphStyle('st', fontName='Helvetica-Bold', fontSize=7.4,
                                    leading=10, textColor=STATUS[plain])
                out.append(Paragraph(plain, st))
            elif cell.startswith('`') and cell.endswith('`'):
                out.append(Paragraph(inline(cell), S['cellmono']))
            else:
                out.append(Paragraph(inline(cell), S['cell']))
        data.append(out)

    t = Table(data, colWidths=widths, repeatRows=1, hAlign='LEFT')
    style = [
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, 0), BAND),
        ('LINEBELOW', (0, 0), (-1, -1), 0.4, RULE),
        ('LINEBEFORE', (0, 0), (0, -1), 1.2, ACCENT),
    ]
    t.setStyle(TableStyle(style))
    return t


def main():
    if not os.path.exists(SRC):
        sys.exit(f'missing {SRC}')
    os.makedirs(os.path.dirname(OUT), exist_ok=True)

    S = styles()
    margin = 16 * mm
    doc = BaseDocTemplate(OUT, pagesize=A4,
                          leftMargin=margin, rightMargin=margin,
                          topMargin=16 * mm, bottomMargin=18 * mm,
                          title='Robot Academy — Feature Register',
                          author='Robot Academy')
    avail = doc.width
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='f')

    def decorate(canvas, d):
        canvas.saveState()
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.5)
        canvas.line(d.leftMargin, d.bottomMargin - 6 * mm,
                    d.leftMargin + d.width, d.bottomMargin - 6 * mm)
        canvas.setFont('Helvetica', 7.5)
        canvas.setFillColor(DIM)
        canvas.drawString(d.leftMargin, d.bottomMargin - 10 * mm,
                          'Robot Academy — Feature Register')
        canvas.drawRightString(d.leftMargin + d.width, d.bottomMargin - 10 * mm,
                               f'Page {canvas.getPageNumber()}')
        canvas.restoreState()

    doc.addPageTemplates([PageTemplate(id='main', frames=[frame], onPage=decorate)])

    story = []
    lines = open(SRC, encoding='utf-8').read().split('\n')
    i = 0
    first_h1 = True

    while i < len(lines):
        line = lines[i].rstrip()

        if line.startswith('# '):
            story.append(Paragraph(inline(line[2:]), S['h1']))
            if first_h1:
                first_h1 = False
            i += 1
            continue

        if line.startswith('## '):
            story.append(Paragraph(inline(line[3:]), S['h2']))
            i += 1
            continue

        if line.startswith('### '):
            story.append(Paragraph(inline(line[4:]), S['h3']))
            i += 1
            continue

        # table
        if line.startswith('|'):
            header = parse_rows(line)
            i += 1
            if i < len(lines) and set(lines[i].replace('|', '').strip()) <= set('-: '):
                i += 1
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append(parse_rows(lines[i]))
                i += 1
            story.append(build_table(header, rows, S, avail))
            story.append(Spacer(1, 8))
            continue

        if line.startswith('- '):
            body = line[2:]
            i += 1
            # fold continuation lines
            while i < len(lines) and lines[i].startswith('  ') and lines[i].strip():
                body += ' ' + lines[i].strip()
                i += 1
            story.append(Paragraph(inline(body), S['bullet'], bulletText='•'))
            continue

        if line.startswith('---'):
            story.append(Spacer(1, 4))
            i += 1
            continue

        if line.strip():
            body = line
            i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].startswith(('#', '|', '-', '*')):
                body += ' ' + lines[i].strip()
                i += 1
            story.append(Paragraph(inline(body), S['body']))
            continue

        i += 1

    doc.build(story)
    print(f'wrote {OUT}')


if __name__ == '__main__':
    main()
