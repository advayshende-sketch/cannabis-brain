// Brain regions. `pos` is in normalized brain-space coordinates:
//   x: -1 (left) … +1 (right)
//   y: -1 (bottom) … +1 (top)
//   z: -1 (posterior/back) … +1 (anterior/front)
// These are mapped onto the loaded model's bounding box at runtime, so markers
// land in approximately the right anatomical spot regardless of the mesh scale.

export const REGIONS = [
  {
    id: 'prefrontal-cortex',
    group: 'Cerebral cortex',
    name: 'Cerebral cortex: Prefrontal cortex',
    pos: [0.35, 0.45, 0.85],
    desc: 'The prefrontal cortex a part of the frontal lobe, it is associated with executive functions, and is capable of associating experiences that are necessary for the production of abstract ideas, judgment, emotions, and personality.',
    refs: [
      'Snell R. Chapter 8: The Structure and Functional Localization of the Cerebral Cortex In Snell R. Clinical Neuroanatomy. 7th ed. Wolters Kluwer Health/Lippincott Williams & Wilkins; 2010: 284-303.',
      'Grow WA. Chapter 32: The Cerebral Cortex In Haines DE, Mihailoff GA, eds. Fundamental Neuroscience for Basic and Clinical Applications. 5th ed. Elsevier Health Sciences; 2018: 468-479.e1.'
    ]
  },
  {
    id: 'motor-cortex',
    group: 'Cerebral cortex',
    name: 'Cerebral cortex: Motor cortex',
    pos: [0.4, 0.85, 0.2],
    desc: 'The primary motor cortex lies in the precentral gyrus of the frontal lobe. It is responsible for generating the neural impulses that control the execution of voluntary movement throughout the body.',
    refs: [
      'Snell R. Chapter 8: The Structure and Functional Localization of the Cerebral Cortex. Clinical Neuroanatomy. 7th ed. 2010: 284-303.'
    ]
  },
  {
    id: 'somatosensory-cortex',
    group: 'Cerebral cortex',
    name: 'Cerebral cortex: Somatosensory cortex',
    pos: [0.4, 0.85, -0.1],
    desc: 'The primary somatosensory cortex is located in the postcentral gyrus of the parietal lobe. It processes sensory information from touch, temperature, pain and proprioception across the body.',
    refs: [
      'Purves D, et al. Neuroscience. 6th ed. Oxford University Press; 2018.'
    ]
  },
  {
    id: 'visual-cortex',
    group: 'Cerebral cortex',
    name: 'Cerebral cortex: Visual cortex',
    pos: [0.15, 0.3, -0.95],
    desc: 'The primary visual cortex occupies the occipital lobe at the posterior pole of the brain. It receives and processes visual information relayed from the retina via the lateral geniculate nucleus of the thalamus.',
    refs: [
      'Purves D, et al. Neuroscience. 6th ed. Oxford University Press; 2018.'
    ]
  },
  {
    id: 'auditory-cortex',
    group: 'Cerebral cortex',
    name: 'Cerebral cortex: Auditory cortex',
    pos: [0.9, -0.1, 0.05],
    desc: 'The primary auditory cortex lies in the superior temporal gyrus of the temporal lobe. It is the first cortical region to process auditory information, mapping sound frequencies tonotopically.',
    refs: [
      'Standring S. Gray’s Anatomy. 42nd ed. Elsevier; 2020.'
    ]
  },
  {
    id: 'brocas-area',
    group: 'Cerebral cortex',
    name: 'Cerebral cortex: Broca’s area',
    pos: [0.7, 0.2, 0.6],
    desc: 'Broca’s area sits in the inferior frontal gyrus of the dominant hemisphere. It is critical for speech production and language processing; damage here produces expressive (non-fluent) aphasia.',
    refs: [
      'Snell R. Clinical Neuroanatomy. 7th ed. 2010.'
    ]
  },
  {
    id: 'wernickes-area',
    group: 'Cerebral cortex',
    name: 'Cerebral cortex: Wernicke’s area',
    pos: [0.8, 0.15, -0.4],
    desc: 'Wernicke’s area lies in the posterior superior temporal gyrus of the dominant hemisphere. It is essential for the comprehension of written and spoken language; damage produces receptive (fluent) aphasia.',
    refs: [
      'Standring S. Gray’s Anatomy. 42nd ed. Elsevier; 2020.'
    ]
  },
  {
    id: 'cerebellum',
    group: 'Hindbrain',
    name: 'Cerebellum',
    pos: [0.1, -0.6, -0.7],
    desc: 'The cerebellum sits beneath the occipital lobes at the back of the brain. It coordinates voluntary movements such as posture, balance, coordination and speech, producing smooth and balanced muscular activity.',
    refs: [
      'Snell R. Chapter 6: The Cerebellum and Its Connections. Clinical Neuroanatomy. 7th ed. 2010.'
    ]
  },
  {
    id: 'brainstem',
    group: 'Brainstem',
    name: 'Brainstem',
    pos: [0.0, -0.7, 0.1],
    desc: 'The brainstem connects the cerebrum with the spinal cord and comprises the midbrain, pons and medulla oblongata. It regulates vital autonomic functions including breathing, heart rate and consciousness.',
    refs: [
      'Standring S. Gray’s Anatomy. 42nd ed. Elsevier; 2020.'
    ]
  },
  {
    id: 'thalamus',
    group: 'Diencephalon',
    name: 'Thalamus',
    pos: [0.0, 0.05, 0.0],
    desc: 'The thalamus is a paired structure deep within the forebrain. It acts as the brain’s central relay station, channelling sensory and motor signals to the cerebral cortex and regulating consciousness and alertness.',
    refs: [
      'Purves D, et al. Neuroscience. 6th ed. Oxford University Press; 2018.'
    ]
  },
  {
    id: 'hippocampus',
    group: 'Limbic system',
    name: 'Hippocampus',
    pos: [0.45, -0.2, -0.1],
    desc: 'The hippocampus is a seahorse-shaped structure in the medial temporal lobe. It is central to the formation of new declarative memories and to spatial navigation.',
    refs: [
      'Andersen P, et al. The Hippocampus Book. Oxford University Press; 2007.'
    ]
  },
  {
    id: 'amygdala',
    group: 'Limbic system',
    name: 'Amygdala',
    pos: [0.5, -0.25, 0.25],
    desc: 'The amygdala is an almond-shaped cluster of nuclei in the medial temporal lobe. It processes emotionally salient stimuli, particularly fear and threat, and modulates memory consolidation.',
    refs: [
      'LeDoux J. The Emotional Brain. Simon & Schuster; 1996.'
    ]
  }
];
