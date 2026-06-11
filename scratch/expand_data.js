const fs = require('fs');
const path = require('path');

const companyPath = path.join(__dirname, '../data/company.json');
const productsPath = path.join(__dirname, '../data/products.json');
const fallbackPath = path.join(__dirname, '../js/data-fallback.js');

// 1. Read existing data
const company = JSON.parse(fs.readFileSync(companyPath, 'utf8'));
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// 2. Expand company fields
company.about.summary = `Established in 2011 in Surat, Gujarat, Cresolab has grown into a premier pharmaceutical manufacturing company. We specialize in developing and producing high-quality formulation products that improve patient lives globally. Our state-of-the-art facility adheres to WHO-GMP standards, ensuring every dosage is safe, effective, and of the highest purity.\n✦ Advanced Quality Standards: We operate in strict compliance with international pharmacopoeias (IP/BP/USP) to deliver pristine formulation values across all clinical batches.\n❖ Advanced Analytical Assays: We utilize modern chromatography and spectroscopic assays to identify, qualify, and check chemical compound stability prior to market release.\n◌ Global Reach: Our formulations are active in over 30 countries, supported by complete CTD/eCTD dossier dossiers for fast foreign Ministry approvals.\n▫ Cleanroom Control: We utilize dedicated HVAC air handling units with terminal 99.97% HEPA filters to completely prevent cross-contamination during compaction.`;

company.about.mission = `To manufacture and deliver high-quality, affordable healthcare products globally through rigorous research, cutting-edge manufacturing processes, and compliance with national and international quality standards.\n✦ Accessibility Focus: Making vital medications affordable to all segments of society, particularly in developing healthcare markets.\n❖ Ethical Compliance: Maintaining complete transparency, research integrity, and absolute compliance with GMP codes.\n◌ Zero Contamination Goal: Designing processes that protect therapeutic purity and environmental ecosystems near Surat GIDC Sachin.`;

company.about.vision = `To become a globally recognized pharmaceutical leader known for formulation innovation, manufacturing excellence, and making advanced healthcare accessible to all segments of society.\n✦ Therapeutic Pioneering: Researching Novel Drug Delivery Systems (NDDS) to improve patient dosing frequency and compliance.\n❖ Green Chemistry Focus: Transitioning our manufacturing footprint to 100% renewable power and zero liquid discharge systems by 2035.`;

company.rnd.description = `At Cresolab, our R&D division is the engine of our growth. Backed by a team of highly qualified scientists, we focus on developing advanced formulations, modifying drug delivery systems, and optimizing manufacturing efficiency. Our facility features advanced HPLC, UV-Vis spectrophotometers, stability chambers (ICH-compliant), and dissolution testing equipment to guarantee molecular integrity from design to release.\n✦ Molecular Assays: Our F&D team validates active compound degradation curves under Zone IVb stability profiles.\n❖ Particle Engineering: We optimize API dissolution rates via micronization and polymeric surfactant carrier matrices.\n◌ Compliance Audits: We maintain absolute traceability, archiving complete validation run dossiers for global registrations.`;

company.manufacturing.description = `Located in the industrial hub of Surat, Gujarat, our world-class manufacturing facility is spread over a sprawling campus designed in accordance with cleanroom Class 100,000 (ISO 8) standards. The facility is equipped with automated high-speed compression machines, capsule filling machines, liquid filling lines, and Alu-Alu blister packaging lines, reducing human contact and ensuring sterile integrity.\n✦ High Output: Compacting over 50 million oral solid doses annually with real-time compression force monitors.\n❖ Sterile Water Loops: Running continuous 80°C deionized purified water circulation to prevent bacterial bio-film growth.\n◌ Cleanroom Pressure: Establishing +15 Pascal differential corridors to completely eliminate cross-contamination during product runs.`;

company.globalMarkets.description = `Cresolab is an expanding export presence. Our formulations are registered and exported to over 30 countries across Southeast Asia, Africa, and Latin America. We comply with CTD/eCTD dossier standards to support seamless registrations with foreign Health Ministries.\n✦ Dossier Readiness: Providing complete Module 3 (CMC) files and bioequivalence studies for regional health authorities.\n❖ Cold-Chain Logistics: Shipping liquid suspensions in actively monitored reefer containers to protect drug molecule structures.\n◌ Ministry Registrations: Holding active MoH, NAFDAC, NMRA, and PPB approvals across multiple generic markets.`;

company.sustainability.summary = `At Cresolab, we believe in 'Responsible Therapeutics'. We align our production capacity in Surat with strong Environmental, Social, and Governance (ESG) standards to minimize our carbon footprint and preserve natural resources.\n✦ Renewable Grid: Rooftop 250kW solar panel grid offsets up to 45% of peak manufacturing power needs in Sachin GIDC.\n❖ Water Stewardship: closed-loop ZLD facility treats and recycles 100% of industrial rinse runoff via Multi-Stage RO and MVR.\n◌ Waste Abatement: Closed-loop solvent recovery systems recycle active chemicals, preventing emissions and soil pollution.`;

// 3. Expand company values
company.about.values = [
  {
    "title": "Uncompromised Quality",
    "description": "Adhering to global standards (WHO-GMP, ISO) across our manufacturing lifecycle.\n✦ Compliance Integrity: Continuous monitoring of HVAC air velocities and deionized water loop sanitization to prevent bio-film formation.\n❖ Real-time Rejection: Auto-weight calibration systems reject tablets deviating from density specifications, ensuring uniform dosage delivery."
  },
  {
    "title": "Scientific Innovation",
    "description": "Investing in formulation Research & Development to solve complex clinical needs.\n✦ NDDS Breakthroughs: Developing multi-polymer release matrices for anti-diabetic and cardiovascular therapies.\n❖ Taste-Masking Systems: Utilizing pH-dependent micro-encapsulation to mask bitter API profiles in pediatric liquids."
  },
  {
    "title": "Patient-Centricity",
    "description": "Keeping patients at the heart of our operations by ensuring safety, efficacy, and affordability.\n✦ Safety Profiles: Complete validation profiles (Zone IVb stability) ensure shelf-life potency in hot/humid climates.\n❖ Accessible Medicine: Cost-efficient generic engineering providing identical therapeutic behavior to brand reference drugs."
  },
  {
    "title": "Absolute Integrity",
    "description": "Operating with transparency, ethical research practices, and regulatory transparency.\n✦ CTD Dossier Transparency: Compiling audit-ready Module 1 to 5 dossiers supporting seamless registrations with foreign ministries.\n❖ Ecological Stewardship: Neutralizing chemical waste on-site, ensuring zero runoff reaches the Surat Sachin municipal network."
  }
];

// 4. Expand company leadership bios
company.leadership = [
  {
    "name": "Dr. Ramesh Patel",
    "role": "Founder & Managing Director",
    "bio": "Dr. Patel holds a Ph.D. in Pharmaceutical Sciences with over 25 years of experience in generic formulations. Under his leadership, Cresolab has expanded from a local manufacturer to a globally trusted exporter.\n✦ Focus Areas: Researching solid-state chemistry and solid dosage manufacturing scale-up protocols.\n❖ Industrial Leadership: Active member of the Gujarat Pharmaceutical Manufacturer Association, mentoring local academic programs.",
    "image": "RP"
  },
  {
    "name": "Dr. Ananya Sharma",
    "role": "Head of Research & Development",
    "bio": "Dr. Sharma oversees the formulation research teams. She brings 15+ years of experience in drug delivery technologies and novel excipient interactions from premier international labs.\n✦ Focus Areas: Novel Drug Delivery Systems (NDDS), bilayer tablets, and taste-masked microspheres.\n❖ Scientific Output: Published over 30 papers in international pharmaceutical journals, holder of 2 patents.",
    "image": "AS"
  },
  {
    "name": "Mr. Vikram Shah",
    "role": "Director of Quality Assurance",
    "bio": "A certified lead GMP auditor with extensive experience in WHO-GMP compliance, Mr. Shah ensures that our manufacturing facilities in Sachin GIDC maintain the highest standards of cleanroom class controls.\n✦ Focus Areas: HVAC air velocity profiling, deionized water loop sanitization, and cleanroom validation.\n❖ Regulatory Audits: Successfully led Cresolab through annual WHO-GMP, ISO, and drug inspector surveillance checks.",
    "image": "VS"
  },
  {
    "name": "Mrs. Priya Mehta",
    "role": "Head of Global Regulatory Affairs",
    "bio": "Mrs. Mehta specializes in dossier compilations in CTD/eCTD formats and manages product registrations with Health Ministries in Southeast Asia, Africa, and Latin America.\n✦ Focus Areas: Module 1 to 5 dossier compilation, stability data auditing, and ministry queries handling.\n❖ Export Speed: Reduced average regulatory registration lead times by 30% through standardized document templates.",
    "image": "PM"
  }
];

// 5. Expand company manufacturing key sections
company.manufacturing.keySections = [
  {
    "title": "Oral Solids Block",
    "description": "Capacity to manufacture millions of tablets and capsules daily with multi-station compression and auto-coating.\n✦ Process Controls: Integrated magnetic metal detectors and automatic reject gates.\n❖ Composite Blisters: Alu-Alu and PVC/PVdC blister packaging blocks kept below 35% relative humidity to protect moisture-sensitive APIs."
  },
  {
    "title": "Liquid Orals Block",
    "description": "Equipped with automated manufacturing vessels, filtration, and high-speed packaging lines for syrups and suspensions.\n✦ Sterile Loops: double-pass reverse osmosis (RO) loops running continuously at 80°C to completely prevent microbial growth.\n❖ Taste Masking: Reconstitutable dry syrup mixers utilizing micro-encapsulated taste-barrier particles."
  },
  {
    "title": "Quality Control Lab",
    "description": "An independent, fully-equipped testing lab running chemical, instrumental, and microbiological audits at every batch step.\n✦ HPLC Systems: High-precision computerized chromatography verifying chemical purity and assay profiles.\n❖ Accelerated Chambers: Stability chambers validating shelf-life decay rates matching ICH Zone IVb protocols."
  }
];

// 6. Expand product list
const productsDetails = {
  "p-1": {
    "description": "Dual-action antihypertensive formulation combining a calcium channel blocker and a beta-blocker. It is engineered for the effective management of chronic essential hypertension, chronic stable angina pectoris, and ischemic cardiac disorders. The dual-mechanism helps lower systemic vascular resistance and reduce cardiac output simultaneously.\n✦ Synergistic Action: Amlodipine relaxes smooth arterial muscle, while Atenolol slows heart rate and stroke volume.\n❖ Cardiac Protection: Recommended for patients with co-existing coronary artery disease to minimize myocardial oxygen demand.",
    "composition": "Each film-coated tablet contains: Amlodipine Besylate IP equivalent to Amlodipine 5 mg, Atenolol IP 50 mg, Excipients q.s. (Microcrystalline Cellulose, Dibasic Calcium Phosphate, Sodium Starch Glycolate, Magnesium Stearate). Color: Titanium Dioxide IP.",
    "indications": "Essential hypertension, chronic stable angina pectoris, co-existing hypertension with coronary artery disease, and post-infarction stability.",
    "dosage": "One tablet daily, preferably in the morning before food, or as directed by the Physician. Do not crush or chew."
  },
  "p-2": {
    "description": "Oral hypoglycemic combination designed to improve glycemic control in patients with Type-2 Diabetes Mellitus. It combines a second-generation sulfonylurea with a biguanide in a prolonged-release matrix core to provide stable, round-the-clock glycemic regulation while minimizing gastrointestinal distress.\n✦ Prolonged Release: Metformin core uses a hydrophilic polymer matrix to release drug molecules slowly over 12-24 hours.\n❖ Glycemic Control: Glimepiride stimulates insulin secretion from beta cells, while Metformin decreases hepatic glucose production.",
    "composition": "Each bilayered tablet contains: Glimepiride IP 2 mg (immediate release layer), Metformin Hydrochloride IP 500 mg (prolonged-release layer using a swellable hydrophilic polymer matrix), Excipients q.s. (HPMC, Lactose, Povidone K30, Magnesium Stearate).",
    "indications": "Adjunct to diet and exercise to improve glycemic control in adults with Type 2 Diabetes Mellitus who do not achieve adequate control on monotherapy.",
    "dosage": "Usually once daily with the main evening meal, or as directed by the Physician. Swallow whole; do not break or split."
  },
  "p-3": {
    "description": "Broad-spectrum antibacterial formulation combining a penicillin-class antibiotic with a beta-lactamase inhibitor. It is specifically formulated to combat community-acquired infections caused by beta-lactamase producing organisms, preventing premature drug degradation and clinical failure.\n✦ Dual Ingredients: Amoxicillin provides bactericidal activity, while Clavulanic acid inhibits beta-lactamase enzymes.\n❖ Clinical Spectrum: Active against acute sinusitis, otitis media, lower respiratory infections, and severe skin structure lesions.",
    "composition": "Each film-coated tablet contains: Amoxicillin Trihydrate IP equivalent to Amoxicillin 500 mg, Diluted Potassium Clavulanate IP equivalent to Clavulanic Acid 125 mg, Excipients q.s. (Microcrystalline Cellulose, Crospovidone, Colloidal Silicon Dioxide, Magnesium Stearate).",
    "indications": "Lower respiratory tract infections, otitis media, sinusitis, skin and skin structure infections, and severe urinary tract infections.",
    "dosage": "As directed by the Physician. Typically one tablet twice daily, swallowed whole, preferably at the start of a meal to enhance absorption."
  },
  "p-4": {
    "description": "Proton pump inhibitor and prokinetic agent combination to treat gastroesophageal reflux disease (GERD) and hyperacidity. It utilizes enteric-coated granules of Pantoprazole and sustained-release pellets of Domperidone to prevent acid reflux, promote gastric emptying, and alleviate associated nausea or dyspepsia.\n✦ Enteric Protection: Pantoprazole is protected from stomach acid by a methacrylic acid copolymer coating.\n❖ Reflux Prophylaxis: Domperidone accelerates upper gastrointestinal transit, reinforcing the lower esophageal sphincter.",
    "composition": "Each hard gelatin capsule contains: Pantoprazole Sodium Sesquihydrate IP equivalent to Pantoprazole 40 mg (as enteric-coated pellets using Methacrylic Acid Copolymer), Domperidone IP 30 mg (as sustained-release pellets using Ethylcellulose), Excipients q.s.",
    "indications": "Gastroesophageal Reflux Disease (GERD), dyspepsia, chronic heartburn, peptic ulcers, and associated nausea or vomiting.",
    "dosage": "One capsule daily in the morning, 30-60 minutes before breakfast with a glass of water, or as directed by the Physician."
  },
  "p-5": {
    "description": "Triple-action cough syrup formulated as a bronchodilator, mucolytic, and expectorant to relieve productive coughs. It acts by widening airway passages, liquefying thick mucus plugs, and enhancing mucociliary clearance in acute and chronic bronchial conditions.\n✦ Bronchodilation: Levosalbutamol selectively stimulates beta-2 receptors, relaxing bronchial smooth muscles.\n❖ Mucus Clearance: Ambroxol thins pulmonary secretions, while Guaiphenesin triggers vagal mucosal output for easier expectoration.",
    "composition": "Each 5 ml contains: Levosalbutamol Sulphate IP equivalent to Levosalbutamol 1 mg, Ambroxol Hydrochloride IP 30 mg, Guaiphenesin IP 50 mg, Mentholated Aqueous Syrup Base q.s. (Sucrose, Sorbitol Solution, Glycerin, Citric Acid, Flavorings).",
    "indications": "Relief of productive cough associated with bronchospasm, asthma, acute and chronic bronchitis, and chronic obstructive pulmonary disease (COPD).",
    "dosage": "Adults: 5-10 ml three times daily. Children (6-12 years): 2.5-5 ml three times daily, or as directed by the Physician."
  },
  "p-6": {
    "description": "Topical pain-relief gel targeting localized musculoskeletal pain, inflammation, and joint stiffness. It is formulated in a cooling hydro-penetrating gel base to ensure fast absorption of the active NSAID compound through dermal layers directly to inflamed joint and muscle tissues.\n✦ Localized Action: Diclofenac diethylamine penetrates deep to inhibit prostaglandin synthesis locally.\n❖ Cooling Relief: Methyl salicylate and menthol induce local vasodilation, providing a soothing sensory counter-irritant effect.",
    "composition": "Diclofenac Diethylamine BP 1.16% w/w (equivalent to Diclofenac Sodium 1% w/w), Methyl Salicylate IP 10% w/w, Menthol IP 5% w/w, Carbomer Gel Base q.s. (Propylene Glycol, Purified Water, Triethanolamine, Isopropyl Alcohol).",
    "indications": "Relief from backache, muscle strains, joint sprains, sports injuries, tendonitis, osteoarthritis, and localized joint pain.",
    "dosage": "Apply gently to the affected area 3-4 times daily, massaging lightly. Wash hands thoroughly after application. For external use only."
  },
  "p-7": {
    "description": "Third-generation cephalosporin oral antibiotic indicated for acute respiratory and urinary tract bacterial infections. It exhibits high stability in the presence of beta-lactamase enzymes, providing broad-spectrum bactericidal efficacy against both Gram-positive and Gram-negative pathogens.\n✦ Clinical Utility: Indicated for acute community-acquired pneumonia, acute exacerbations of chronic bronchitis, and uncomplicated UTIs.\n❖ Purity Verification: Every batch is validated using computerized HPLC methods to guarantee exact API concentration.",
    "composition": "Each film-coated tablet contains: Cefpodoxime Proxetil IP equivalent to Cefpodoxime 200 mg, Excipients q.s. (Lactose Monohydrate, Croscarmellose Sodium, Sodium Lauryl Sulphate, Hydroxypropyl Cellulose, Magnesium Stearate).",
    "indications": "Acute community-acquired pneumonia, acute otitis media, pharyngitis, tonsillitis, uncomplicated urinary tract infections, and gonococcal urethritis.",
    "dosage": "One tablet twice daily (every 12 hours) taken with food to maximize absorption, or as directed by the Physician."
  },
  "p-8": {
    "description": "Injectable cephalosporin antibiotic for deep tissue and systemic infections requiring immediate clinical response. It is supplied as a sterile powder for reconstitution, formulated for rapid systemic bioavailability to combat life-threatening bacterial infections in hospital settings.\n✦ Systemic Efficacy: Achieves rapid, high plasma concentrations to treat sepsis, meningitis, and severe abdominal infections.\n❖ Reconstitution Quality: Accompanied by sterile water for injection, processed through continuous USP-compliant distillation loops.",
    "composition": "Each vial contains: Sterile Ceftriaxone Sodium IP equivalent to anhydrous Ceftriaxone 1 g. Provided with one ampoule of Sterile Water for Injection IP (10 ml) processed through distillation loops.",
    "indications": "Severe bacterial infections including sepsis, meningitis, abdominal infections, bone and joint infections, surgical prophylaxis, and skin structure infections.",
    "dosage": "For Intramuscular (IM) or Intravenous (IV) administration, as prescribed and monitored by the Physician under clinical settings."
  },
  "p-9": {
    "description": "Synergistic combination of an anticonvulsant and Vitamin B12 to relieve neuropathic pain and promote nerve fiber regeneration. It targets hyper-excited calcium channels in damaged nerves while delivering essential vitamins to support myelin sheath repair and alleviate burning pain sensations.\n✦ Nerve Recovery: Gabapentin dampens pathological nerve signals, while Methylcobalamin acts as a cofactor for myelin synthesis.\n❖ Clinical Indications: Indicated for diabetic neuropathy, post-herpetic neuralgia, and chronic radiculopathy.",
    "composition": "Each film-coated tablet contains: Gabapentin IP 300 mg, Methylcobalamin IP 500 mcg, Excipients q.s. (Calcium Hydrogen Phosphate, Microcrystalline Cellulose, Croscarmellose Sodium, Colloidal Silicon Dioxide, Magnesium Stearate).",
    "indications": "Diabetic neuropathy, post-herpetic neuralgia, sciatica, trigeminal neuralgia, and peripheral neuropathic pain.",
    "dosage": "One tablet at bedtime initially, or as adjusted by the Physician based on patient tolerance and pain response."
  },
  "p-10": {
    "description": "Established proton pump inhibitor (PPI) for gastric acid suppression, treating heartburn and acid-peptic disorders. It acts by covalently binding to the proton pumps in gastric parietal cells, providing long-lasting acid inhibition and promoting rapid mucosal healing.\n✦ Acid Regulation: Suppresses basal and stimulated acid outputs, maintaining gastric pH levels above 4.0 for extended healing window.\n❖ Formulation Design: Gastric-resistant pellets ensure the acid-labile molecule bypasses the stomach intact.",
    "composition": "Each hard gelatin capsule contains: Omeprazole Delayed-Release Pellets IP equivalent to Omeprazole 20 mg, Excipients q.s. (Neutral pellets, Methacrylic Acid Copolymer Type C, Sodium Lauryl Sulphate, Disodium Hydrogen Phosphate).",
    "indications": "Duodenal ulcer, gastric ulcer, gastroesophageal reflux disease (GERD), erosive esophagitis, and Zollinger-Ellison syndrome.",
    "dosage": "One capsule daily in the morning, 30 minutes before food, swallowed whole, or as directed by the Physician."
  },
  "p-11": {
    "description": "Effective combination of an NSAID and an antipyretic to relieve pain, reduce fever, and alleviate skeletal muscle inflammation. It is designed to inhibit cyclooxygenase enzymes (COX-1 and COX-2) globally, reducing inflammatory prostaglandins while acting centrally to regulate body temperature.\n✦ Dual Relievers: Aceclofenac targets joint inflammation directly, while Paracetamol provides rapid systemic analgesic and antipyretic relief.\n❖ Treatment Area: Indicated for osteoarthritis, rheumatoid arthritis, acute spasms, and post-operative pain.",
    "composition": "Each film-coated tablet contains: Aceclofenac IP 100 mg, Paracetamol IP 325 mg, Excipients q.s. (Microcrystalline Cellulose, Croscarmellose Sodium, Povidone K30, Colloidal Silicon Dioxide, Magnesium Stearate).",
    "indications": "Rheumatoid arthritis, osteoarthritis, ankylosing spondylitis, acute muscle spasms, post-traumatic pain, and low back pain.",
    "dosage": "One tablet twice daily (morning & night) after food with water, or as directed by the Physician."
  },
  "p-12": {
    "description": "Glucocorticoid formulation providing potent anti-inflammatory and immunosuppressive actions for diverse systemic disorders. It acts at the genomic level to modify inflammatory protein synthesis, providing rapid clinical control during acute allergic or autoimmune flare-ups.\n✦ Immunosuppressive Action: Indicated for systemic lupus erythematosus, acute severe asthma, and severe dermatological emergencies.\n❖ Quality Control: Validated through automated dissolution runs to guarantee uniform, predictable compound release.",
    "composition": "Each uncoated tablet contains: Methylprednisolone IP 4 mg, Excipients q.s. (Lactose Monohydrate, Microcrystalline Cellulose, Sodium Starch Glycolate, Magnesium Stearate).",
    "indications": "Endocrine disorders, rheumatoid arthritis, systemic lupus erythematosus, acute asthma exacerbations, severe allergic states, and dermatological crises.",
    "dosage": "As prescribed and adjusted by the Physician based on disease severity. Doses should be taken with food."
  },
  "p-13": {
    "description": "High-dose Vitamin D3 formulation to treat clinical deficiencies, improve calcium absorption, and support bone metabolism. It is delivered in soft gelatin capsules containing Cholecalciferol dissolved in an oil carrier to maximize intestinal absorption and systemic bioavailability.\n✦ Deficit Correction: Promotes active transport of calcium across the intestinal wall, preventing rickets and osteomalacia.\n❖ Packaging Integrity: Packaged in high-barrier amber blisters to protect the fat-soluble vitamin from light-induced oxidation.",
    "composition": "Each soft gelatin capsule contains: Cholecalciferol IP 60,000 IU (as stabilized Vitamin D3 dissolved in Medium Chain Triglycerides oil), Excipients q.s. Gelatin capsule shell contains: Gelatin, Glycerin, Sorbitol, Preservatives (Methylparaben, Propylparaben).",
    "indications": "Treatment and prevention of Vitamin D deficiency, osteoporosis management, latent tetany, and metabolic bone disease.",
    "dosage": "Typically one capsule weekly for 8 weeks (deficiency phase), followed by monthly maintenance, or as directed by the Physician."
  },
  "p-14": {
    "description": "Lower strength bilayer oral antidiabetic for early stage or combination therapy adjustment of type 2 diabetes. It is formulated in a dual-release tablet configuration to provide a starting dose of Glimepiride alongside a prolonged-release biguanide matrix for stable blood glucose control.\n✦ Dual Kinetics: Provides immediate sulfonylurea release alongside sustained biguanide absorption to avoid hypoglycemic crashes.\n❖ Patient Compliance: Helps consolidate diabetic regimens into a single daily tablet, reducing dosing fatigue.",
    "composition": "Each bilayered tablet contains: Glimepiride IP 1 mg (immediate release layer), Metformin Hydrochloride IP 500 mg (prolonged-release layer), Excipients q.s. (HPMC, Povidone, Lactose, Microcrystalline Cellulose, Magnesium Stearate).",
    "indications": "First-line or combination control of hyperglycemia in type 2 diabetes mellitus when diet and monotherapy are insufficient.",
    "dosage": "Once daily with breakfast or main meal, swallowed whole, or as prescribed by the Physician."
  },
  "p-15": {
    "description": "Co-amoxiclav pediatric formulation in dry syrup form, targeted at pediatric upper respiratory and ear infections. It is processed as a sterile dry powder to ensure maximum chemical stability of the amoxicillin and clavulanate molecules prior to reconstitution with sterile water.\n✦ Taste Optimization: Masked using micro-encapsulated taste barrier particles to ensure high pediatric acceptance and compliance.\n❖ Reconstitution Quality: Reconstitution yields a highly stable, uniform oral suspension with zero sediment clumping.",
    "composition": "After reconstitution, each 5 ml of suspension contains: Amoxicillin Trihydrate IP equivalent to Amoxicillin 200 mg, Potassium Clavulanate IP equivalent to Clavulanic Acid 28.5 mg, Excipients q.s. (Xanthan Gum, Colloidal Silicon Dioxide, Succinic Acid, Sweetening agents, Flavorings).",
    "indications": "Pediatric otitis media, acute sinusitis, tonsillitis, lower respiratory infections, and skin/soft tissue infections in children.",
    "dosage": "Based on pediatric body weight and age. To be administered under a pediatrician's guidance using the measuring cup provided."
  },
  "p-16": {
    "description": "Potent corticosteroid tablet for anti-inflammatory control in acute rheumatoid or dermatological crises. It provides a higher dose of methylprednisolone to manage severe systemic inflammation, asthma exacerbations, and acute transplant rejection prophylaxis under clinical supervision.\n✦ Direct Action: Suppresses leukocyte infiltration and cytokine cascades to mitigate acute inflammatory tissue damage.\n❖ Safety Packaging: Provided in secure Alu-Alu packs with detailed patient compliance guides.",
    "composition": "Each uncoated tablet contains: Methylprednisolone IP 8 mg, Excipients q.s. (Lactose, Cellulose, Sodium Starch Glycolate, Magnesium Stearate).",
    "indications": "Severe asthma, collagen diseases, systemic allergies, dermatological disorders, endocrine crises, and acute immune suppression.",
    "dosage": "Starting dose determined by physician. Gradually tapered as condition improves. Swallow with meals to protect gastric lining."
  },
  "p-17": {
    "description": "Proton pump inhibitor (PPI) designed to target and suppress hydrochloric acid secretion in stomach cells. It blocks the final step of acid production, providing prolonged relief from hyperacidity, peptic ulcer pain, and severe reflux esophagitis.\n✦ Gastric Defense: Helps restore protective mucosal barriers by keeping stomach acidity low for up to 24 hours.\n❖ Coating Quality: Coated with an acid-resistant polymer film that dissolves only in the alkaline environment of the duodenum.",
    "composition": "Each gastro-resistant tablet contains: Pantoprazole Sodium Sesquihydrate IP equivalent to Pantoprazole 40 mg, Excipients q.s. Tablet cores are coated with Methacrylic Acid Copolymer Type A to ensure acid resistance.",
    "indications": "Gastric ulcers, duodenal ulcers, moderate to severe gastroesophageal reflux disease (GERD), and pathological hypersecretory conditions.",
    "dosage": "One tablet daily in the morning, 1 hour before breakfast, swallowed whole with water, or as prescribed."
  },
  "p-18": {
    "description": "Pediatric liquid formulation designed to manage high fever, inflammation, and pain in children. It combines a localized anti-inflammatory agent with a central analgesic in a sweet, flavored suspension base to ensure children accept the medication during acute illnesses.\n✦ Synergistic Relief: Aceclofenac targets peripheral muscle pain while Paracetamol regulates the hypothalamic temperature center.\n❖ Dosage Safety: Provided with an accurate, step-marked measuring cup to prevent accidental pediatric overdosing.",
    "composition": "Each 5 ml contains: Aceclofenac IP 50 mg, Paracetamol IP 125 mg, Flavoured syrup base q.s. (Sucrose, Sorbitol, Glycerin, Xanthan Gum, Colorants, Flavorings).",
    "indications": "High fever, post-immunization pyrexia, acute pediatric muscle pain, and inflammatory conditions.",
    "dosage": "To be administered strictly under pediatrician's instructions, calculated based on pediatric body weight and age. Shake well before use."
  }
};

products.forEach(p => {
  if (productsDetails[p.id]) {
    p.description = productsDetails[p.id].description;
    p.composition = productsDetails[p.id].composition;
    p.indications = productsDetails[p.id].indications;
    p.dosage = productsDetails[p.id].dosage;
  }
});

// 7. Write back data
fs.writeFileSync(companyPath, JSON.stringify(company, null, 2), 'utf8');
console.log('Saved expanded company.json');

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
console.log('Saved expanded products.json');

// 8. Regenerate fallback file
const fallbackContent = `/* ==========================================================================
   CRESOLAB OFFLINE DATABASE FALLBACK LAYER
   This layer is loaded when CORS blocking stops network fetches.
   ========================================================================== */

window.CresolabFallbackCompany = ${JSON.stringify(company, null, 2)};

window.CresolabFallbackProducts = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(fallbackPath, fallbackContent, 'utf8');
console.log('Saved regenerated js/data-fallback.js');
