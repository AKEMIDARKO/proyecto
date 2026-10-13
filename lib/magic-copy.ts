import type { Lang } from './locales';
const rows = {
 es:['Guardián del archivo','Lumen, el pequeño guardián mágico de Magia Archive','Reposo','Saludar','Pausar efectos','Activar efectos','Música del archivo','Velada violeta','Pequeñas constelaciones','No se puede reproducir el audio.'],
 en:['Keeper of the archive','Lumen, Magia Archive’s little magical keeper','Still','Greet','Pause effects','Enable effects','Archive music','Violet evening','Little constellations','Audio is unavailable.'],
 ja:['アーカイブの守り手','Magia Archiveを守る小さな魔法の仲間、ルーメン','静止','挨拶','演出を停止','演出を有効化','アーカイブの音楽','紫の夕べ','小さな星座','音声を再生できません。'],
 pl:['Strażnik archiwum','Lumen, mały magiczny strażnik Magia Archive','Spoczynek','Powitaj','Wstrzymaj efekty','Włącz efekty','Muzyka archiwum','Fioletowy wieczór','Małe konstelacje','Dźwięk jest niedostępny.'],
 fr:['Gardien des archives','Lumen, le petit gardien magique de Magia Archive','Repos','Saluer','Suspendre les effets','Activer les effets','Musique des archives','Soirée violette','Petites constellations','Le son est indisponible.'],
 it:['Custode dell’archivio','Lumen, il piccolo custode magico di Magia Archive','Riposo','Saluta','Sospendi gli effetti','Attiva gli effetti','Musica dell’archivio','Serata viola','Piccole costellazioni','Audio non disponibile.'],
 de:['Hüter des Archivs','Lumen, der kleine magische Hüter von Magia Archive','Ruhe','Begrüßen','Effekte pausieren','Effekte aktivieren','Musik des Archivs','Violetter Abend','Kleine Sternbilder','Audio ist nicht verfügbar.'],
 'zh-Hans':['档案守护者','露门，Magia Archive的小小魔法守护者','静止','打招呼','暂停特效','启用特效','档案馆音乐','紫色夜晚','小小星座','无法播放音频。'],
 'zh-Hant':['檔案守護者','露門，Magia Archive的小小魔法守護者','靜止','打招呼','暫停特效','啟用特效','檔案館音樂','紫色夜晚','小小星座','無法播放音訊。'],
} satisfies Record<Lang,string[]>;
export const magicCopy=Object.fromEntries(Object.entries(rows).map(([lang,r])=>[lang,Object.fromEntries(['title','character','still','greet','pause','enable','playlist','a','b','error'].map((key,i)=>[key,r[i]]))])) as Record<Lang,Record<string,string>>;
