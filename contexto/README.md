# FisMat · Contexto para la dirección visual

El video explora qué se puede aprender de dos registros breves de aceleración al comparar sus oscilaciones dominantes. Este contexto procede de la revisión técnica previa de FisMat. Cuando se incorpore el informe final, usar sus tablas, unidades y cifras como referencia para la producción.

## Qué se compara

El primer registro corresponde al sensor durante un evento sísmico. El segundo es una referencia ambiental tomada en otra estación y en otro momento. Ambos contienen valores de aceleración normalizados, muestreados cada 0.4 s. En las figuras, cada serie necesita su propia identificación. Si se comparan amplitudes, ambas deben compartir una escala de normalización comparable.

## Cómo se lee el modelo

1. **Muestras.** Los puntos representan mediciones discretas. Una curva continua sobre ellos representa un ajuste. Esta distinción permite mostrar tanto la oscilación como las desviaciones de cada muestra.
2. **Armónico dominante.** El análisis de Fourier descompone el registro en oscilaciones. En el borrador, el armónico dominante reúne el 94.8 % de la energía matemática de la señal de aceleración respecto a su media. La cifra describe la variación de la señal.
3. **Ajuste.** La separación entre máximos sugiere un periodo de unos 4.0 s. Con esa frecuencia fijada, la regresión estima nivel medio, amplitud y fase para cada registro. Dos curvas en ejes comparables permiten apreciar cuánto difieren las amplitudes aun cuando el periodo del ajuste es común.
4. **Comparación.** El borrador obtiene un cociente de energía de las componentes ajustadas de **R = 35 ± 5** (sensor respecto a referencia ambiental). El margen corresponde al ajuste con periodo fijo. Una representación fiel muestra dos magnitudes comparadas. Un reparto «97 % sismo / 3 % ruido» atribuiría al sensor una composición que estas mediciones no permiten determinar.

## Alcance de las imágenes

El sensor registra aceleración en una posición. Un dibujo del desplazamiento del terreno representa otra magnitud, cuya segunda derivada temporal se relaciona con la aceleración. Las ondas P y S pueden ilustrar, respectivamente, movimiento longitudinal y transversal. Esas imágenes corresponden al modelo físico. Los registros disponibles no permiten reconstruir por separado ambas ondas.

## Uso con el prompt

Aplicar [el prompt de dirección visual](../PROMPT.md) a este material. La primera entrega reúne la esencia, los pilares y tres mundos visuales. La elección de una dirección precede al desarrollo del kit de arte.
