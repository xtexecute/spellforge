from pathlib import Path
import json
import math
import sys
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).parent
OUT = ROOT / "current"
OUT.mkdir(parents=True, exist_ok=True)
SS = 4
ONLY = set(sys.argv[1:])

COLORS = {
    "player":"#83dec8", "chaser":"#ed8682", "shooter":"#d48ac7",
    "charger":"#f2ac6c", "splitter":"#90c879", "swarm":"#b0e783",
    "tank":"#9b91c4", "wisp":"#80d8e4", "golden":"#f1ca78",
    "sentinel":"#e4b85c", "crimson":"#872b42", "healer":"#83d7ae",
    "sniper":"#d9749d", "burrower":"#9675a9", "shieldbearer":"#bdac74",
    "mimic":"#90cbd3", "mirror":"#a9ebeb", "voidmage":"#a276cf",
    "voidboss":"#7b51a7", "frostboss":"#96e4ee", "splitboss":"#f0a3ad",
    "splitA":"#ffb077", "splitB":"#e2a2e9", "engine":"#ffe083",
}

RADII = {
    "player":16,"chaser":19,"shooter":16,"charger":18,"splitter":18,"swarm":11,
    "tank":25,"wisp":14,"golden":34,"sentinel":23,"crimson":26,"healer":19,
    "sniper":16,"burrower":18,"shieldbearer":22,"mimic":19,"mirror":21,
    "voidmage":17,"voidboss":37,"frostboss":42,"splitboss":39,"splitA":25,
    "splitB":25,"engine":49,
}

def sprite(name, size=128):
    im = Image.new("RGBA", (size*SS, size*SS), (0,0,0,0))
    d = ImageDraw.Draw(im)
    cx = cy = size*SS//2
    # Coordinates are game-space pixels. Large canvases add transparent padding;
    # they must not scale the model a second time.
    k = SS
    dark = "#2a2637"
    def p(x,y): return (round(cx+x*k), round(cy+y*k))
    def poly(points, fill, outline=dark, width=3):
        pts=[p(x,y) for x,y in points]; d.polygon(pts, fill=fill)
        if outline:d.line(pts+[pts[0]], fill=outline, width=max(1,round(width*k)), joint="curve")
    def rect(box, fill, outline=None, width=2):
        x1,y1=p(box[0],box[1]);x2,y2=p(box[2],box[3]);d.rectangle((x1,y1,x2,y2),fill=fill,outline=outline,width=max(1,round(width*k)))
    def ellipse(box, fill, outline=None, width=2):
        x1,y1=p(box[0],box[1]);x2,y2=p(box[2],box[3]);d.ellipse((x1,y1,x2,y2),fill=fill,outline=outline,width=max(1,round(width*k)))
    def line(points, fill, width=3):d.line([p(x,y) for x,y in points],fill=fill,width=max(1,round(width*k)),joint="curve")
    c=COLORS.get(name,"#d8cad8")

    if name=="player":
        poly([(10,-4),(-10,-18),(-20,18),(9,13)],c,"#214c54")
        ellipse((-10,-15,5,0),"#f4d9a7")
        poly([(-18,-17),(3,-33),(10,-14)],"#30435c",None);rect((-25,-17,12,-11),"#30435c")
        rect((7,-5,43,4),"#f4d9a7");ellipse((39,-5,48,4),"#ffd985")
    elif name=="chaser":
        poly([(29,0),(-25,-20),(-14,0),(-25,20)],c)
        poly([(28,-7),(42,0),(28,7)],"#fff0dc",None);rect((0,-9,7,-3),dark)
    elif name=="shooter":
        poly([(7,-27),(-20,-18),(-26,28),(15,28)],c);ellipse((-10,-27,10,-7),c,dark,3)
        rect((4,-6,43,6),"#eadcff");rect((38,-4,49,4),dark)
    elif name=="charger":
        poly([(35,0),(-25,-28),(-12,0),(-25,28)],c)
        line([(-4,-17),(32,-33)],"#ffe0a1",5);line([(-4,17),(32,33)],"#ffe0a1",5)
    elif name=="splitter":
        ellipse((-31,-23,8,23),c,dark,3);ellipse((-8,-23,31,23),c,dark,3);line([(0,-24),(0,24)],"#d8ffb9",3)
    elif name=="swarm":
        poly([(25,0),(0,-23),(-23,0),(0,23)],c)
        for y in (-10,0,10):line([(-6,y),(-29,y+(6 if y>0 else -6 if y<0 else 0))],"#d8ffb9",3)
    elif name=="tank":
        rect((-38,-29,35,-17),"#514a67");rect((-38,17,35,29),"#514a67")
        rect((-30,-19,27,19),c,dark,3);rect((-5,-10,43,10),"#c6bde3");rect((37,-6,52,6),dark)
    elif name=="wisp":
        poly([(27,0),(12,-22),(-5,-29),(-27,-5),(-18,17),(-5,8),(2,27),(15,11)],c)
        rect((2,-10,7,-5),"#e8ffff");rect((2,3,7,8),"#e8ffff")
    elif name=="golden":
        for i,(x,y) in enumerate(((0,-42),(30,-30),(42,0),(30,30),(0,42),(-30,30),(-42,0),(-30,-30))):
            if abs(x)>abs(y):rect((x-8,y-4,x+8,y+4),"#8b6b2d")
            else:rect((x-4,y-8,x+4,y+8),"#8b6b2d")
        poly([(34,0),(24,24),(0,34),(-24,24),(-34,0),(-24,-24),(0,-34),(24,-24)],c)
        ellipse((-12,-12,12,12),"#fff0ad")
    elif name=="sentinel":
        rect((-17,-17,17,17),c,dark,3);rect((17,-5,43,5),"#8a6a35");rect((-43,-5,-17,5),"#8a6a35");rect((-5,-43,5,-17),"#8a6a35");rect((-5,17,5,43),"#8a6a35")
    elif name=="crimson":
        rect((-35,-22,30,22),"#682139",dark,3)
        for x in (-30,-5,20):rect((x,-32,x+11,-19),"#b44e5a")
        rect((28,-6,57,6),"#b44e5a")
    elif name=="healer":
        poly([(8,-29),(-17,-18),(-29,30),(20,30)],c);rect((-4,-17,4,18),"#eaffef");rect((-16,-5,16,5),"#eaffef")
        line([(17,-31),(17,31)],"#a5ffd0",4);ellipse((11,-37,23,-25),"#d5ffe8")
    elif name=="sniper":
        rect((-28,-10,17,10),c,dark,3);rect((0,-5,55,5),"#ffd2df");rect((48,-3,63,3),dark);rect((-16,10,-8,23),dark)
    elif name=="burrower":
        poly([(34,0),(0,-27),(-27,0),(0,27)],c)
        for i in range(3):ellipse((15-i*9,-7-i*3,29-i*9,7+i*3),None,"#dac3ef",3)
        rect((-11,-10,-5,-4),dark);rect((-11,4,-5,10),dark)
    elif name=="shieldbearer":
        rect((-28,-19,13,19),c,dark,3)
        poly([(8,-34),(40,-22),(40,22),(8,34)],"#e9dcaa","#765d42",3);rect((15,-4,45,4),"#806b42")
    elif name in ("mimic","mirror"):
        poly([(7,-30),(-18,-16),(-28,30),(14,30)],c);rect((4,-5,43,5),"#d6ffff");rect((37,-3,49,3),dark)
        rect((-9,-11,-3,-5),dark);rect((-9,4,-3,10),dark)
    elif name in ("voidmage","voidboss"):
        r=44 if name=="voidboss" else 28
        poly([(r*.45,-r),(-r*.7,-r*.55),(-r,r),(0,r*.65),(r,r)],c)
        rect((-13,-8,-6,2),"#e7caff");rect((6,-8,13,2),"#e7caff")
        if name=="voidboss":
            ellipse((-53,-53,53,53),None,"#c792ff",4)
            for x,y in ((0,-61),(53,-31),(53,31),(0,61),(-53,31),(-53,-31)):ellipse((x-7,y-7,x+7,y+7),"#d39aff")
    elif name=="frostboss":
        poly([(0,-55),(35,-18),(51,28),(0,52),(-51,28),(-35,-18)],c,"#e2ffff",4)
        for x in (-23,0,23):poly([(x,-10),(x+10,26),(x-10,26)],"#e5ffff","#9bdde7",2)
    elif name=="splitboss":
        ellipse((-46,-46,46,46),"#ffb077",dark,3);d.pieslice((p(-46,-46)[0],p(-46,-46)[1],p(46,46)[0],p(46,46)[1]),90,270,fill="#e2a2e9")
        line([(0,-46),(0,46)],dark,4);rect((5,-7,54,7),"#fff0cf")
    elif name=="splitA":
        poly([(39,0),(-31,-31),(-15,0),(-31,31)],c);rect((0,-5,43,5),"#ffe0af")
    elif name=="splitB":
        rect((-31,-21,21,21),c,dark,3);rect((0,-5,51,5),"#f9dcff")
    elif name=="engine":
        for i in range(12):
            a=i*math.tau/12;u=(math.cos(a),math.sin(a));v=(-u[1],u[0]);inner,outer,half=42,72,5
            arm=[(u[0]*inner+v[0]*half,u[1]*inner+v[1]*half),(u[0]*outer+v[0]*half,u[1]*outer+v[1]*half),(u[0]*outer-v[0]*half,u[1]*outer-v[1]*half),(u[0]*inner-v[0]*half,u[1]*inner-v[1]*half)]
            poly(arm,"#a97a39",dark,2)
            tip=68;poly([(u[0]*(tip-4)+v[0]*3,u[1]*(tip-4)+v[1]*3),(u[0]*(tip+5)+v[0]*3,u[1]*(tip+5)+v[1]*3),(u[0]*(tip+5)-v[0]*3,u[1]*(tip+5)-v[1]*3),(u[0]*(tip-4)-v[0]*3,u[1]*(tip-4)-v[1]*3)],"#f9d06d",None)
        poly([(math.cos(i*math.tau/12)*49,math.sin(i*math.tau/12)*49) for i in range(12)],c)
        ellipse((-21,-21,21,21),"#5d4524")
    return im.resize((size,size),Image.Resampling.LANCZOS)

def polish(im, fill=.82):
    """Normalize transparent padding and add outline plus soft directional shading."""
    alpha=im.getchannel("A");box=alpha.getbbox()
    if not box:return im
    crop=im.crop(box);limit=round(min(im.width,im.height)*fill);scale=min(limit/crop.width,limit/crop.height)
    crop=crop.resize((max(1,round(crop.width*scale)),max(1,round(crop.height*scale))),Image.Resampling.LANCZOS)
    placed=Image.new("RGBA",im.size,(0,0,0,0));x=(im.width-crop.width)//2;y=(im.height-crop.height)//2;placed.alpha_composite(crop,(x,y))
    a=placed.getchannel("A");outline=a.filter(ImageFilter.MaxFilter(5));edge=Image.new("RGBA",im.size,(28,25,38,0));edge.putalpha(outline);edge.alpha_composite(placed)
    shade=Image.new("RGBA",im.size,(0,0,0,0));px=shade.load();mask=a.load()
    for yy in range(im.height):
        for xx in range(im.width):
            if mask[xx,yy]:
                light=max(0,1-(xx/im.width+yy/im.height))*26;dark=max(0,(xx/im.width+yy/im.height)-1)*38
                px[xx,yy]=(255,255,255,round(light)) if light else (18,14,28,round(dark))
    edge.alpha_composite(shade);return edge

manifest=json.loads((ROOT/"sprite-manifest.json").read_text(encoding="utf-8")) if ONLY and (ROOT/"sprite-manifest.json").exists() else {}
for name in COLORS:
    if ONLY and name not in ONLY: continue
    size=256 if name in {"engine","voidboss","frostboss","splitboss"} else 128
    im=polish(sprite(name,size))
    path=OUT/f"{name}.png";im.save(path)
    manifest[name]={"file":f"current/{name}.png","canvas":[size,size],"anchor":[.5,.5],"faces":"right","displayRadius":RADII[name]}

extras={
    "pickup_health":("#8ce5a6","plus"),"pickup_mana":("#f5c682","diamond"),"pickup_shield":("#88cfff","shield"),
    "missile":("#f5a557","missile"),"void_orb":("#b578f6","orb"),"mine":("#c3a6ff","mine"),
    "crystal":("#7edacc","crystal"),"stone":("#4e596f","stone"),
    "engine_core":("#ffe083","engine_core"),"engine_arm":("#a97a39","engine_arm"),"voidboss_core":("#7b51a7","voidboss_core")
}
for name,(color,kind) in extras.items():
    if ONLY and name not in ONLY: continue
    im=Image.new("RGBA",(128*SS,128*SS),(0,0,0,0));d=ImageDraw.Draw(im);c=64*SS
    def q(v):return round(v*SS)
    if kind=="plus":d.ellipse((q(32),q(32),q(96),q(96)),fill=color,outline="#315344",width=q(3));d.rectangle((q(58),q(43),q(70),q(85)),fill="#effff4");d.rectangle((q(43),q(58),q(85),q(70)),fill="#effff4")
    elif kind=="diamond":d.polygon([(c,q(26)),(q(101),c),(c,q(102)),(q(27),c)],fill=color,outline="#765f30");d.ellipse((q(51),q(48),q(77),q(80)),fill="#fff0bd")
    elif kind=="shield":d.polygon([(c,q(27)),(q(96),q(40)),(q(89),q(84)),(c,q(104)),(q(39),q(84)),(q(32),q(40))],fill=color,outline="#3d6981");d.line([(c,q(35)),(c,q(91))],fill="#dcf5ff",width=q(4))
    elif kind=="missile":d.polygon([(q(104),c),(q(43),q(43)),(q(51),c),(q(43),q(85))],fill=color,outline="#6c3b2b");d.rectangle((q(27),q(55),q(51),q(73)),fill="#ff785d")
    elif kind=="orb":d.ellipse((q(34),q(34),q(94),q(94)),fill=color,outline="#e0b7ff",width=q(4))
    elif kind=="mine":d.ellipse((q(38),q(38),q(90),q(90)),fill=color,outline="#4f3b75",width=q(4));d.ellipse((q(23),q(23),q(105),q(105)),outline="#d8caff",width=q(3))
    elif kind=="crystal":d.polygon([(c,q(18)),(q(103),c),(c,q(110)),(q(25),c)],fill=color,outline="#aaffff")
    elif kind=="engine_core":
        d.polygon([(q(39),q(22)),(q(89),q(22)),(q(106),q(39)),(q(106),q(89)),(q(89),q(106)),(q(39),q(106)),(q(22),q(89)),(q(22),q(39))],fill="#d39b39",outline="#3b2a25",width=q(3))
        d.polygon([(q(43),q(31)),(q(85),q(31)),(q(97),q(43)),(q(97),q(85)),(q(85),q(97)),(q(43),q(97)),(q(31),q(85)),(q(31),q(43))],fill=color,outline="#fff0aa",width=q(2))
        d.rectangle((q(48),q(48),q(80),q(80)),fill="#5d4524",outline="#2a2637",width=q(3));d.rectangle((q(57),q(57),q(71),q(71)),fill="#ffcf62")
        for x,y in ((31,31),(97,31),(97,97),(31,97)):d.ellipse((q(x-3),q(y-3),q(x+3),q(y+3)),fill="#fff0aa")
    elif kind=="engine_arm":
        d.polygon([(q(61),q(55)),(q(108),q(55)),(q(118),q(64)),(q(108),q(73)),(q(61),q(73))],fill=color,outline="#33261e")
        d.rectangle((q(72),q(59),q(103),q(69)),fill="#dcae59");d.rectangle((q(103),q(58),q(118),q(70)),fill="#ffe274");d.rectangle((q(61),q(59),q(69),q(69)),fill="#6f4b29")
    elif kind=="voidboss_core":
        d.polygon([(q(64),q(15)),(q(91),q(30)),(q(108),q(105)),(q(76),q(90)),(q(64),q(111)),(q(52),q(90)),(q(20),q(105)),(q(37),q(30))],fill=color,outline="#2a173e")
        d.polygon([(q(64),q(24)),(q(83),q(36)),(q(75),q(63)),(q(53),q(63)),(q(45),q(36))],fill="#39205e")
        d.rectangle((q(48),q(65),q(80),q(91)),fill="#4b286d");d.rectangle((q(52),q(69),q(60),q(77)),fill="#e7caff");d.rectangle((q(68),q(69),q(76),q(77)),fill="#e7caff")
        d.polygon([(q(64),q(91)),(q(52),q(108)),(q(76),q(108))],fill="#a85ee0")
    else:d.ellipse((q(24),q(25),q(104),q(103)),fill=color,outline="#8490a5",width=q(4))
    im=im.resize((128,128),Image.Resampling.LANCZOS)
    if kind not in {"engine_arm"}:im=polish(im,.86)
    im.save(OUT/f"{name}.png");manifest[name]={"file":f"current/{name}.png","canvas":[128,128],"anchor":[.5,.5],"faces":"right"}

(ROOT/"sprite-manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8")

names=list(manifest);thumb=96;cols=6;rows=(len(names)+cols-1)//cols
sheet=Image.new("RGBA",(cols*thumb,rows*(thumb+20)),"#172033")
sd=ImageDraw.Draw(sheet)
for i,name in enumerate(names):
    x=(i%cols)*thumb;y=(i//cols)*(thumb+20);im=Image.open(ROOT/manifest[name]["file"]).convert("RGBA");im.thumbnail((88,88),Image.Resampling.LANCZOS);sheet.alpha_composite(im,(x+(thumb-im.width)//2,y+(88-im.height)//2));sd.text((x+4,y+91),name,fill="#f6eddd")
sheet.save(ROOT/"current-sprites-contact-sheet.png")
print(f"Exported {len(manifest)} PNG sprites to {OUT}")
