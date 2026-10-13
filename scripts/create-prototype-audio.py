"""Generate two short original audio sketches; no samples or existing songs."""
import math, struct, wave
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'public/assets/prototype'
rate,duration=22050,12
for name,notes in [('violet',[261.6256,329.6276,391.9954,523.2511]),('constellations',[293.6648,369.9944,440.0,587.3295])]:
 data=bytearray()
 for i in range(rate*duration):
  t=i/rate; sample=0
  for j,frequency in enumerate(notes):
   age=(t-j*1.6)%6.4
   envelope=(1-math.exp(-age*14))*math.exp(-age*1.5)
   sample+=math.sin(2*math.pi*frequency*t)*envelope*.075
  sample*=min(1,t/.4,(duration-t)/.8)
  data.extend(struct.pack('<h',round(max(-1,min(1,sample))*32767)))
 with wave.open(str(out/(name+'.wav')),'wb') as audio:
  audio.setnchannels(1);audio.setsampwidth(2);audio.setframerate(rate);audio.writeframes(data)
 print(name,len(data)+44,'bytes')
