øpython3 -c "
import pandas as pd
import sys

try:
    # Leer Excel
    df = pd.read_excel('Planilla 9 ControledePesaje.xlsx')
    print('📊 ESTRUCTURA DE PLANILLA 9:')
    print('Columnas:', list(df.columns))
    print('Filas:', len(df))
    print('\\n--- PRIMERAS 10 FILAS ---')
    print(df.head(10).to_string())
    print('\\n--- ÚLTIMAS 5 FILAS ---')
    print(df.tail(5).to_string())
    
    # Información adicional útil
    print('\\n--- INFORMACIÓN ADICIONAL ---')
    print('Tipos de datos:')
    print(df.dtypes)
    
    # Ver si hay valores únicos importantes
    if 'Animal' in df.columns or 'ID' in df.columns:
        col_animal = 'Animal' if 'Animal' in df.columns else 'ID'
        print(f'\\nAnimales únicos: {df[col_animal].nunique()}')
        print(f'Primeros animales: {df[col_animal].unique()[:10]}')
        
except Exception as e:
    print(f'Error: {e}')
    print('\\nVerificando ubicación del archivo...')
    import os
    files = [f for f in os.listdir('.') if 'planilla' in f.lower() or 'pesaje' in f.lower()]
    print('Archivos encontrados:', files)
"import pandas as pd

file_path = "/Users/a149952/Documents/RanchOS/Planillas Dos/Plani≈≈

