// Cannabis (THC / CBD) impact by brain region.
// `pos` is in normalized brain-space coordinates:
//   x: -1 (left) … +1 (right)
//   y: -1 (bottom) … +1 (top)
//   z: -1 (posterior/back) … +1 (anterior/front)
// These are mapped onto the loaded model's bounding box at runtime, so markers
// land in approximately the right anatomical spot regardless of the mesh scale.

export const REGIONS = [
  {
    id: 'amygdala',
    name: 'Amygdala',
    fn: 'Emotional processing, fear, threat detection',
    pos: [0.5, -0.25, 0.25],
    general: 'Reduces fear/anxiety at low doses; high doses trigger anxiety and paranoia; alters emotional reactivity; may dampen consolidation of traumatic memories.',
    thc: 'Low doses reduce reactivity to threats; high doses overstimulate → heightened anxiety; disrupts fear-extinction learning.',
    cbd: 'Reduces activation to fear stimuli; promising for PTSD and anxiety treatment.'
  },
  {
    id: 'hippocampus',
    name: 'Hippocampus',
    fn: 'Memory, spatial navigation, learning',
    pos: [0.45, -0.2, -0.1],
    general: 'Disrupts new memory formation; impairs recall; chronic use may reduce volume; interferes with spatial learning.',
    thc: 'Binds densely to CB1 receptors; suppresses long-term potentiation (LTP); disrupts memory-encoding theta waves.',
    cbd: 'May protect neurons from THC damage; some evidence it promotes neurogenesis.'
  },
  {
    id: 'prefrontal-cortex',
    name: 'Prefrontal Cortex',
    fn: 'Executive function, decision-making, impulse control',
    pos: [0.35, 0.45, 0.85],
    general: 'Impairs working memory/concentration; reduces decision-making activity; distorts time perception; heavy adolescent use linked to long-term cognitive changes.',
    thc: 'Disrupts glutamate signaling; alters dopamine release via CB1; temporarily reduces blood flow.',
    cbd: 'May counteract THC-induced impairment; possibly neuroprotective here.'
  },
  {
    id: 'cerebellum',
    name: 'Cerebellum',
    fn: 'Motor coordination, balance, fine motor control',
    pos: [0.1, -0.6, -0.7],
    general: 'Impairs coordination, balance, reaction time; the characteristic "stoned" movement; impairs driving.',
    thc: 'Very dense CB1 receptors → strongly affected; disrupts sync with motor cortex; alters GABA/glutamate balance.',
    cbd: "Minimal impact alone; may slightly buffer THC's motor effects at high ratios."
  },
  {
    id: 'brain-stem',
    name: 'Brain Stem',
    fn: 'Breathing, heart rate, consciousness',
    pos: [0.0, -0.7, 0.05],
    general: "Unlike opioids, doesn't suppress breathing; very low CB1 density in life-critical areas; may reduce nausea; key to cannabis's high safety profile.",
    thc: 'Minimal effect on respiratory control; activates antiemetic pathways (useful in chemo); low receptor density makes fatal overdose essentially impossible.',
    cbd: 'Acts on serotonin receptors to reduce nausea; studied for antiemetic and anti-seizure effects.'
  },
  {
    id: 'thalamus',
    name: 'Thalamus',
    fn: 'Sensory relay, consciousness, alertness',
    pos: [0.0, 0.05, 0.0],
    general: 'Alters sensory processing (enhanced sounds/colors); disrupts filtering of irrelevant stimuli; altered time perception; heightened sensitivity to stimuli.',
    thc: 'Disrupts sensory gating; increases information flow → sensory amplification; alters thalamus–cortex synchrony.',
    cbd: 'May stabilize activity and reduce sensory overload; investigated for pain modulation.'
  },
  {
    id: 'hypothalamus',
    name: 'Hypothalamus',
    fn: 'Appetite, hormones, sleep, homeostasis',
    pos: [0.0, -0.18, 0.18],
    general: 'Stimulates appetite ("munchies"); activates ghrelin; alters REM sleep; heavy use can disrupt hormonal regulation.',
    thc: 'Activates CB1 on hunger neurons; overrides leptin satiety signals; used medically to stimulate appetite in wasting conditions.',
    cbd: 'May suppress appetite at certain doses; interacts with serotonin receptors affecting satiety.'
  },
  {
    id: 'basal-ganglia',
    name: 'Basal Ganglia',
    fn: 'Reward, habit formation, motor control',
    pos: [0.32, 0.12, 0.15],
    general: 'Central to reward and addiction potential; increases dopamine → euphoria; chronic use reduces dopamine sensitivity; linked to motivational deficits.',
    thc: 'Activates the mesolimbic dopamine pathway; reinforces reward signals → repeated use; alters habit-learning circuits.',
    cbd: 'Modulates dopamine without binding CB1 directly; may reduce addictive signaling.'
  }
];
