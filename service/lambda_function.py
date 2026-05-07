import json
import io
import base64
from jinja2 import Template
from xhtml2pdf import pisa

def lambda_handler(event, context):
    try:
        # Recuperar datos del cuerpo de la petición
        body = json.loads(event.get('body', '{}'))
        
        # Mapeo de datos según tu Esquema_DB y diseño
        datos = {
            "nombre_sistema": "Nutri-Tech Calpulalpan",
            "nombre_universidad": "Sistema Nutricional en Línea<br>Universidad Autónoma de Tlaxcala",
            "folio": body.get('consulta_id', 'S/N'),
            "fecha": body.get('fecha_emision', '00/00/0000'),
            
            # --- NUEVA SECCIÓN: ESPECIALISTA ---
            "especialista_nombre": body.get('especialista_nombre', 'No asignado'),
            "especialista_tel": body.get('especialista_tel', 'S/N'),
            
            # Datos del Paciente (Tabla: perfiles)
            "nombre_usuario": body.get('nombre_completo', 'N/A'),
            "curp": body.get('curp', 'N/A'),
            "sexo": body.get('sexo', 'N/A'),
            "gmail": body.get('email', 'N/A'),
            
            # Datos Antropométricos (Tabla: consulta_antropometria)
            "estatura": body.get('estatura', '0.00'),
            "peso": body.get('peso', '0.0'),
            "imc": body.get('imc', '0.0'),
            
            # Resultados
            "motivo": body.get('motivo_consulta', 'No especificado'),
            "diagnostico": body.get('diagnostico', 'Pendiente'),
            "plan_alimenticio": body.get('plan_sugerido', 'Consultar con especialista')
        }

        # Estructura HTML con la nueva sección del Especialista
        html_template = """
        <html>
        <head>
            <style>
                @page { size: letter; margin: 2cm; }
                body { font-family: Helvetica, Arial, sans-serif; color: #333; line-height: 1.4; }
                .header { text-align: center; border-bottom: 3px solid #2980b9; padding-bottom: 10px; margin-bottom: 15px; }
                .header h1 { color: #2980b9; font-size: 22pt; margin: 0; }
                .header p { font-size: 10pt; color: #7f8c8d; margin: 5px 0; }
                
                .meta-data { font-size: 9pt; margin-bottom: 15px; text-align: right; }
                
                .section-title { background: #f4f7f6; border-left: 5px solid #2980b9; padding: 5px 10px; margin-top: 15px; font-weight: bold; font-size: 11pt; }
                
                .grid { margin-top: 8px; font-size: 10pt; }
                .label { font-weight: bold; color: #2980b9; }
                
                .bloque-texto { margin-top: 10px; border: 1px solid #eee; padding: 10px; font-size: 10pt; background: #fafafa; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{{ nombre_sistema }}</h1>
                <p>{{ nombre_universidad }}</p>
            </div>

            <div class="meta-data">
                <strong>FOLIO:</strong> {{ folio }} | <strong>FECHA:</strong> {{ fecha }}
            </div>

            <div class="section-title">ATENDIDO POR</div>
            <div class="grid">
                <p><span class="label">Especialista:</span> {{ especialista_nombre }}</p>
                <p><span class="label">Teléfono de contacto:</span> {{ especialista_tel }}</p>
            </div>

            <div class="section-title">PERFIL DEL USUARIO</div>
            <div class="grid">
                <p><span class="label">Nombre:</span> {{ nombre_usuario }}</p>
                <p><span class="label">CURP:</span> {{ curp }} | <span class="label">Sexo:</span> {{ sexo }}</p>
                <p><span class="label">Email:</span> {{ gmail }}</p>
            </div>

            <div class="section-title">DATOS ANTROPOMÉTRICOS</div>
            <div class="grid">
                <p><span class="label">Estatura:</span> {{ estatura }} m | <span class="label">Peso:</span> {{ peso }} kg | <span class="label">IMC:</span> {{ imc }}</p>
            </div>

            <div class="section-title">RESULTADOS DE LA CONSULTA</div>
            <div class="bloque-texto"><strong>Motivo:</strong><br>{{ motivo }}</div>
            <div class="bloque-texto"><strong>Diagnóstico:</strong><br>{{ diagnostico }}</div>
            <div class="bloque-texto"><strong>Plan Sugerido:</strong><br>{{ plan_alimenticio }}</div>
        </body>
        </html>
        """

        # Renderizado
        template = Template(html_template)
        html_final = template.render(datos)

        result = io.BytesIO()
        pisa.CreatePDF(io.BytesIO(html_final.encode("utf-8")), dest=result)
        pdf_data = result.getvalue()
        result.close()

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="ficha_nutricional.pdf"'
            },
            'body': base64.b64encode(pdf_data).decode('utf-8'),
            'isBase64Encoded': True
        }
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({"error": str(e)})}