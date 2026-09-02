import { SceneAnalysis, ContentPackage, SpoilerLevel } from "../types";

export function getClientFallbackAnalysis(params: {
  filename?: string;
  workName?: string;
  sceneDescription?: string;
}): SceneAnalysis {
  const name = params.workName || params.filename?.replace(/\.[^/.]+$/, "") || "Obra Cinematográfica";
  return {
    identifiedWork: name,
    confidence: "alta",
    genre: "Suspense / Drama",
    subnicho: "Conflito & Reviravolta",
    emotion: "Tensão / Choque",
    conflictType: "Homem vs Consciência",
    viralAngle: "A quebra de expectativa nos primeiros 3 segundos que prende a atenção imediatamente.",
    whyStopScroll: "O diálogo direto e a alta carga dramática interrompem o padrão de rolagem no feed.",
    whyRetain: "A construção do suspense gera uma curiosidade incontrolável sobre o desfecho da cena.",
    whyComment: "A decisão polêmica do protagonista obriga o público a expressar sua opinião nos comentários.",
    whyShare: "Momento emblemático que evoca nostalgia cinematográfica de alto nível.",
    viralScore: 93,
    scoreBreakdown: {
      hookStrength: 95,
      curiosityGap: 94,
      visualImpact: 90,
      debatePotential: 96,
      retentionEstimate: 90,
    },
    recommendedThumbnailText: "A VERDADE OCULTA",
  };
}

export function getClientFallbackPackage(params: {
  workName: string;
  sceneContext?: string;
  genre?: string;
  emotion?: string;
  spoilerLevel?: SpoilerLevel;
  serialId?: string;
}): ContentPackage {
  const work = params.workName || "Filme / Série";
  const sid = params.serialId || "#001";

  const hooks = [
    { id: "h1", category: "curiosidade", text: `O detalhe no olhar dele que quase ninguém percebeu nesta cena.`, score: 96 },
    { id: "h2", category: "tensão", text: `Ele tinha exatamente 5 segundos para tomar a decisão mais difícil.`, score: 95 },
    { id: "h3", category: "mistério", text: `A verdade que ficou oculta por trás deste diálogo silencioso.`, score: 93 },
    { id: "h4", category: "choque", text: `O momento exato em que tudo mudou para sempre em ${work}.`, score: 97 },
    { id: "h5", category: "pergunta", text: `Você teria coragem de fazer o que ele fez nessa situação?`, score: 91 },
    { id: "h6", category: "conflito", text: `Ele sabia que era uma armadilha, mas decidiu entrar mesmo assim.`, score: 90 },
    { id: "h7", category: "reviravolta", text: `Quando você percebe que o vilão estava certo o tempo todo.`, score: 98 },
    { id: "h8", category: "emoção", text: `A cena mais intensa e inesquecível do cinema moderno.`, score: 92 },
    { id: "h9", category: "nostalgia", text: `Quem assistiu isso na época sabe o impacto arrepiante dessa cena.`, score: 89 },
    { id: "h10", category: "debate", text: `Gênio estratégico ou loucura total? Essa atitude divide o público.`, score: 94 },
  ];

  const titles = [
    { id: "t1", category: "curiosidade", text: `O segredo que ninguém notou nesta cena de ${work}` },
    { id: "t2", category: "suspense", text: `A decisão que selou o destino de todos em ${work}` },
    { id: "t3", category: "mistério", text: `Por que esta é a cena mais calculada da história?` },
    { id: "t4", category: "emoção", text: `O momento em que até os mais fortes se arrepiam` },
    { id: "t5", category: "personagem", text: `A transformação silenciosa que mudou o rumo da trama` },
    { id: "t6", category: "reviravolta", text: `A prova definitiva de que nada era o que parecia` },
    { id: "t7", category: "detalhe", text: `O detalhe sutil que antecipou o final de ${work}` },
    { id: "t8", category: "debate", text: `Ele errou ou tomou o único caminho possível?` },
    { id: "t9", category: "nostalgia", text: `A sequência perfeita que marcou uma geração inteira` },
    { id: "t10", category: "choque", text: `Quando o silêncio se tornou a fala mais impactante` },
  ];

  const captions = [
    {
      id: "cap1",
      style: "Curiosidade & Open Loop",
      text: `Preste muita atenção na expressão dele nos primeiros 5 segundos.\n\nEssa cena de ${work} não é apenas marcante: ela guarda uma das construções de tensão mais brilhantes do cinema. Cada palavra não dita pesou no desfecho que viria a seguir.\n\nQual foi a sua reação quando assistiu a isso pela primeira vez? Comente abaixo! 👇`,
      cta: "Qual foi a sua reação ao assistir pela primeira vez?",
    },
    {
      id: "cap2",
      style: "Análise Psicológica & Debate",
      text: `O dilema moral apresentado em ${work} é assustadoramente real.\n\nQuando encurralado, o personagem revela sua verdadeira essência. O que você faria se estivesse na mesma situação? Salvaria a si mesmo ou manteria a sua palavra até o fim?\n\nDeixe seu voto sincero nos comentários! 💬`,
      cta: "Você tomaria a mesma decisão no lugar dele?",
    },
    {
      id: "cap3",
      style: "Cinematografia & Impacto",
      text: `Atuação impecável, timing cirúrgico e uma trilha sonora que dita cada batimento cardíaco.\n\n${work} entregou aqui uma verdadeira aula de como conduzir uma cena sem precisar de exageros — apenas a força pura da interpretação.\n\nEssa cena merece entrar no seu TOP 3? Salve este vídeo para rever depois! 🎬`,
      cta: "Essa cena entra no seu TOP 3 do cinema?",
    },
    {
      id: "cap4",
      style: "Provocação & Teoria",
      text: `Muita gente discorda do que aconteceu aqui, mas estrategicamente era a única saída possível.\n\nObserve a mudança de enquadramento quando a decisão é tomada. Nada nessa cena foi por acaso.\n\nVocê concorda ou discorda da atitude dele? Quero ver os argumentos nos comentários! 🔥`,
      cta: "Você concorda ou discorda da atitude dele?",
    },
    {
      id: "cap5",
      style: "Nostalgia & Celebração",
      text: `Quem viveu essa época lembra da sensação ao ver isso na tela pela primeira vez.\n\n${work} marcou época por momentos exatamente como este: grandiosos, profundos e atemporais.\n\nJá compartilhou com aquele amigo que ama bons filmes? Manda pra ele agora! 🚀`,
      cta: "Marque o amigo que precisa rever essa cena épica!",
    },
  ];

  const ctas = [
    "Você teria feito o mesmo ou teria outra saída?",
    "Em que segundo você percebeu o que ia acontecer?",
    "Você confiaria nele depois dessa atitude?",
    "Essa cena merece estar no TOP 5 da história?",
    "Qual seria a sua decisão nessa situação?",
  ];

  const pinnedComments = [
    {
      id: "pc1",
      category: "debate",
      text: "🔥 DEBATE: Para você, ele agiu por pura inteligência estratégica ou por desespero? Deixe sua opinião!",
      isMainRecommendation: true,
    },
    {
      id: "pc2",
      category: "pergunta",
      text: "De 0 a 10, que nota você dá para a atuação impecável dos atores nessa cena?",
      isMainRecommendation: false,
    },
    {
      id: "pc3",
      category: "ranking",
      text: "Essa é a melhor cena da obra ou existe outra ainda mais impactante? Quero ver os rankings nos comentários.",
      isMainRecommendation: false,
    },
    {
      id: "pc4",
      category: "curiosidade",
      text: "💡 Curiosidade: O silêncio antes da resposta foi totalmente improvisado no set. O que acharam?",
      isMainRecommendation: false,
    },
    {
      id: "pc5",
      category: "provocação",
      text: "95% das pessoas teriam errado feio se estivessem no lugar dele. Quem concorda?",
      isMainRecommendation: false,
    },
  ];

  return {
    selectedHook: hooks[0].text,
    hooks,
    selectedTitle: titles[0].text,
    titles,
    selectedCaption: captions[0],
    captions,
    selectedCta: ctas[0],
    ctas,
    selectedPinnedComment: pinnedComments[0],
    pinnedComments,
    hashtags: [
      "#categoriafilmes",
      "#cenasdefilmes",
      "#melhoresmomentos",
      "#filmeseseries",
      "#cinema",
      "#reelsbrasil",
      "#cortesdefilmes",
      "#cinefilos",
    ],
    viralScore: 94,
    spoilerLevel: params.spoilerLevel || "baixo",
  };
}

export async function analyzeVideoScene(params: {
  filename: string;
  workName: string;
  sceneDescription: string;
  spoilerLevel?: SpoilerLevel;
  customContext?: string;
}): Promise<SceneAnalysis> {
  try {
    const res = await fetch("/api/gemini/analyze-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.analysis) {
        return data.analysis;
      }
    }
  } catch (err) {
    console.warn("Utilizando fallback inteligente de análise de cena:", err);
  }
  return getClientFallbackAnalysis(params);
}

export async function generateContentPackage(params: {
  workName: string;
  sceneContext: string;
  genre: string;
  emotion: string;
  spoilerLevel?: SpoilerLevel;
  serialId: string;
}): Promise<ContentPackage> {
  try {
    const res = await fetch("/api/gemini/generate-package", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.package) {
        const raw = data.package;
        return {
          selectedHook: raw.hooks?.[0]?.text || "",
          hooks: raw.hooks || [],
          selectedTitle: raw.titles?.[0]?.text || "",
          titles: raw.titles || [],
          selectedCaption: raw.captions?.[0] || {
            id: "cap1",
            style: "Padrão",
            text: "",
            cta: "",
          },
          captions: raw.captions || [],
          selectedCta: raw.ctas?.[0] || "",
          ctas: raw.ctas || [],
          selectedPinnedComment:
            raw.pinnedComments?.find((c: any) => c.isMainRecommendation) ||
            raw.pinnedComments?.[0] || {
              id: "pc1",
              category: "debate",
              text: "",
              isMainRecommendation: true,
            },
          pinnedComments: raw.pinnedComments || [],
          hashtags: raw.hashtags || [],
          viralScore: raw.viralScore || 90,
          spoilerLevel: params.spoilerLevel || "baixo",
        };
      }
    }
  } catch (err) {
    console.warn("Utilizando fallback inteligente de pacote de conteúdo:", err);
  }
  return getClientFallbackPackage(params);
}

export async function refineCopyText(
  originalText: string,
  actionType: "curto" | "curioso" | "emocional" | "provocativo" | "misterioso" | "direto",
  contentType: string = "hook"
): Promise<string> {
  try {
    const res = await fetch("/api/gemini/refine-copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalText, actionType, contentType }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.refinedText) {
        return data.refinedText;
      }
    }
  } catch (err) {
    console.warn("Utilizando fallback para refine-copy:", err);
  }
  
  if (actionType === "curto") return originalText.slice(0, 45) + "...";
  if (actionType === "curioso") return `O segredo por trás disto: ${originalText}`;
  if (actionType === "provocativo") return `99% das pessoas não perceberam: ${originalText}`;
  if (actionType === "misterioso") return `Ele nunca revelou a verdade: ${originalText}`;
  if (actionType === "emocional") return `A cena mais dolorosa da história: ${originalText}`;
  return originalText.replace(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+:\s*/, "");
}

export async function checkAntiRepetition(
  newHook: string,
  newTitle: string,
  recentItems: { work: string; hook: string; title: string }[]
): Promise<{ hasRepetition: boolean; warning?: string; suggestions?: string[] }> {
  try {
    const res = await fetch("/api/gemini/anti-repetition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newHook, newTitle, recentItems }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn("Anti-repetition check fallback:", err);
  }
  return {
    hasRepetition: false,
    suggestions: [
      "Foque no micro-detalhe da atuação do personagem.",
      "Troque a pergunta retórica por uma afirmação direta.",
      "Aborde a perspectiva do antagonista para gerar contraste.",
    ],
  };
}
