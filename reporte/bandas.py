import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
plt.rcParams.update({"font.family":"serif","font.serif":["TeX Gyre Termes","Liberation Serif"],"mathtext.fontset":"stix","font.size":10})
fig,ax=plt.subplots(figsize=(6.2,2.6)); ax.set_xscale("log"); ax.set_xlim(0.03,30); ax.set_ylim(0,5)
ax.axvspan(1.25,30,color="0.9",zorder=0)
def band(a,b,y,c,t):
    ax.add_patch(Rectangle((a,y-0.3),b-a,0.6,fc=c,ec="none")); ax.text((a*b)**0.5,y+0.45,t,ha="center",va="bottom",fontsize=8.5)
band(0.05,0.1,1.6,"#c9d6e8","Microsismo primario\n10–20 s")
band(0.1,0.33,3.4,"#9fb3cf","Microsismo secundario\n3–10 s")
band(1,20,3.4,"#e9b896","Sismos pequeños\n1–20 Hz")
ax.axvline(0.238,c="#1f3b63",lw=1.6); ax.text(0.26,0.5,"Pico del registro: 0.24 Hz (4.2 s)",color="#1f3b63",fontsize=8.5)
ax.text(5.5,1.4,"No observable con\n$\\Delta t=0.4$ s (>1.25 Hz)",ha="center",fontsize=8.5,color="0.3")
ax.set_yticks([]); ax.set_xlabel("Frecuencia (Hz)")
for s in ["top","right","left"]: ax.spines[s].set_visible(False)
fig.tight_layout(); fig.savefig("bandas.pdf")
