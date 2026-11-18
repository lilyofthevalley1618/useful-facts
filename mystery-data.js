/* False North — original YA case file for the Useful Facts Geography tab.
   Original plot, characters, and setting. Not based on any existing novel or film. */
const MYSTERY_DATA = {
  title: "False North",
  premise: "At a summer fellowship for students who love maps, a celebrated cartographer is found dead in a Lisbon map room. The only message she leaves is a page whose north arrow is drawn a few degrees off. Her planned research packets — one for each region of the world — are still sealed. Opening them, a California teen and the other fellows discover that someone has been moving countries on paper, to hide where stolen objects really came from.",
  how: "Passing a learn-path quiz at 90% in a region opens that region's first clue, and passing four of those quizzes opens the second. Scoring 90% on the region's full test opens the third. The last chapters unlock when every region's test has been passed at 90%.",
  characters: [
    { id: "mira", name: "Mira Solano", age: "16", from: "Santa Cruz, California", role: "Narrator, Open Meridian fellow", intro: "Mira notices what is missing: a name left off a caption, a river drawn in the wrong mouth, a person who should be in a group photo and isn't. She wants to be a journalist. She is not a trained investigator; she is careful, and she writes everything down." },
    { id: "jonah", name: "Jonah Adeyemi", age: "17", from: "Lagos, Nigeria", role: "Photography fellow", intro: "Jonah jokes when he is scared. He takes too many pictures and then, later, notices the people at the edges of them." },
    { id: "priya", name: "Priya Raman", age: "17", from: "Bengaluru, India", role: "Records fellow", intro: "Priya keeps a contradiction log in a cloth-bound notebook. If two documents disagree, she draws a box around both and does not look away." },
    { id: "wren", name: "Wren Voss", age: "18", from: "near Buenos Aires", role: "Elena's grand-niece", intro: "Wren arrived late to the welcome night and left early. She looks like someone who has been arguing for a long time." },
    { id: "luca", name: "Luca Benedetti", age: "17", from: "Genoa, Italy", role: "Logistics fellow", intro: "Luca grew up around docks and shipping schedules. He is quick to help and quicker to change the subject when money comes up." },
    { id: "samira", name: "Samira Haddad", age: "42", from: "Amman, Jordan", role: "Program director", intro: "Samira runs Open Meridian with a quiet, exact kindness. She also leaves rooms to take calls she will not explain." },
    { id: "theo", name: "Theo Park", age: "19", from: "Vancouver, Canada (born in Seoul)", role: "Database fellow", intro: "Theo maintains the map files. He is the person who says, \"I can clean that up,\" and then does, usually before anyone has asked." },
    { id: "elena", name: "Elena Voss", age: "57", from: "Born in Rosario, Argentina; later based in Berlin", role: "Founder of Open Meridian, the victim", intro: "Elena spent her life correcting old maps and teaching students not to trust a handsome north arrow. She had planned a seven-stop research tour for the fellows. She did not live to give the welcome lecture." }
  ],
  suspects: [
    {
      id: "wren",
      name: "Wren Voss",
      role: "Elena's grand-niece",
      stages: [
        { min: 0, text: "Eighteen. Arrived late. Left the map room before the lecture was supposed to start. Elena's closest living family on the trip." },
        { min: 1, text: "A witness heard Wren and Elena arguing about \"the cottage and the truth.\" Wren will not say what the truth was." },
        { min: 2, text: "A postcard Elena mailed to Wren from the south says: if I don't come back, look at the longitudes, not the stories. It sounds like a warning. It also sounds like a motive, if you want it to." },
        { min: 3, text: "Wren thought Elena was involved in the thefts. She confronted her, Elena said she was ending it the next day, and Wren ran out. She did not go back up the stairs. Grief and a bad assumption are not the same as guilt, but they can look like it." }
      ]
    },
    {
      id: "luca",
      name: "Luca Benedetti",
      role: "Logistics fellow",
      stages: [
        { min: 0, text: "Seventeen, from Genoa. Knows ports, bills of lading, and how crates move when nobody is watching the paperwork." },
        { min: 1, text: "A bill of lading from a South American port carries Open Meridian's project code. Luca's uncle works in logistics. Luca goes quiet when someone mentions money." },
        { min: 2, text: "Luca bought pens at a Lisbon stationery shop for the whole group. The ink on the torn atlas page could have come from one of those pens — if you don't look too closely." },
        { min: 3, text: "The debt is real and ordinary: tuition for his sister. A clerk confirms it. The cheap shop pens do not match the archival ink on the page. Luca was a convenient story. He was not the hand that drew the river." }
      ]
    },
    {
      id: "samira",
      name: "Samira Haddad",
      role: "Program director",
      stages: [
        { min: 0, text: "She organized the fellowship and the itinerary. She is careful with keys, and with who enters the map room after hours." },
        { min: 1, text: "Samira has been secretive about a shipping permit. She leaves rooms to take calls. On the night Elena died, Samira was near the building." },
        { min: 2, text: "The \"permit\" is a letter asking a customs friend to hold a crate, not to release one. Samira was trying to stop a shipment, not start one." },
        { min: 3, text: "She had suspected the database was being altered. She asked Elena to wait until they had proof, which is why she looked like she was hiding something. She was. She was hiding a half-finished case." }
      ]
    },
    {
      id: "theo",
      name: "Theo Park",
      role: "Database fellow",
      stages: [
        { min: 0, text: "Nineteen. Quiet, helpful, always ready to fix a file. He sits a little outside the jokes and a little too close to the laptops." },
        { min: 1, text: "In Jonah's photograph of the map room, Theo is visible in a glass door, closing a laptop. He told the group he was downstairs, checking the projector." },
        { min: 2, text: "Customs records and file metadata keep showing the same login: theo.park, approving \"scan corrections\" and saving new coordinates at odd hours." },
        { min: 3, text: "Theo had admin access he should not have kept. He met a man who was not on the fellowship list in Singapore, days before Lisbon, when he said he was home. After Elena died he was still at the keyboard, covering tracks. Helpful, all the way down." }
      ]
    },
    {
      id: "contact",
      name: "The unnamed contact",
      role: "Outside the fellowship",
      stages: [
        { min: 0, text: "Someone has been paying for coordinates to move. The fellows have not seen a face yet — only a shadow in the paperwork." },
        { min: 1, text: "A café meeting on the other side of the world, a crate that should not have existed, a dealer who likes \"survey errors\" as a cover story." },
        { min: 2, text: "The contact is real, and guilty of buying what Theo sold. But the contact was not in the Lisbon map room. The person who was, and who knew how to lie with a map, is closer than that." }
      ]
    }
  ],
  theories: [
    { need: ["intro"], text: "Elena died in the Lisbon map room after someone left her a lying north arrow. The sealed regional packets she prepared may be the rest of the message." },
    { need: ["eu-3"], text: "The torn page is a doctored plate of West Africa. Whoever killed Elena may also have been quietly \"correcting\" the Open Meridian database." },
    { need: ["af-3", "eu-3"], text: "Export papers only work if the find-spot on the map is the official one. Moving a river on paper can move a crime across a border." },
    { need: ["sa-1"], text: "A South American bill of lading has the project's code on it. Luca looks like the obvious person to ask — maybe too obvious." },
    { need: ["na-2"], text: "Samira's secret permit was a hold, not a release. She may have been trying to stop the same crate Elena was chasing." },
    { need: ["us-2", "as-3"], text: "The same login keeps appearing on the corrections: Theo's. The helpful person with the laptop may be the person who needed Elena silent." },
    { need: ["oc-3", "eu-2", "us-3"], text: "The ink, the reflection in the door, and a note in the margin all point at the person who was supposed to be fixing the files." },
    { need: ["end-3"], text: "Theo Park altered coordinates for money, then killed Elena when she was about to say so in a room full of students. The maps can be put back. The north arrow, Mira thinks, should be checked whenever someone else is holding the pen." }
  ],
  clues: [
    {
      id: "intro",
      title: "The wrong north",
      place: "Lisbon, Portugal",
      teaser: "",
      unlock: { type: "free" },
      body: "The Open Meridian fellowship was supposed to begin with a lecture Elena Voss had been writing for months: How a Map Can Lie by Two Degrees and Still Look Official.\n\nShe never gave it.\n\nMira Solano, sixteen, from Santa Cruz, was still pinning her name badge on in the hallway when the talking in the map room changed pitch. Later the official version would be careful and short. Elena was found at the foot of the mezzanine stairs. She had gone back up after the others went down for the welcome dinner. There was no struggle loud enough to hear over the river and the tram. On the drafting table, a page had been torn from a heavy atlas and left under a brass weight. The coast on the page was faintly familiar. The north arrow had been redrawn, just a few degrees off, in a brown archival ink.\n\nSamira Haddad, the director, locked the room and called the police. Wren Voss, Elena's grand-niece, stood on the landing and would not come any closer. Luca Benedetti kept offering to fetch water. Priya Raman started a new page in her notebook titled, already, What does not match. Jonah Adeyemi, who had been taking pictures of the tiles, put his camera away and then, as if he could not help it, took one more.\n\nTheo Park said he would back up the project files, so nothing would be lost.\n\nElena had already packed seven sealed packets, one for each stop on the research tour she had planned for them. Samira, after a long call Mira was not supposed to hear, said the police would keep the atlas and the room. The packets were copies. Elena had wanted the fellows to open them in order. \"We will open them,\" Samira said, \"because she wrote them to be opened. And because I do not think the north arrow was a decoration.\"\n\nMira wrote one line at the top of her own notebook, the only thing she was sure of: Someone moved north. Then they moved her."
    },
    {
      id: "eu-1",
      title: "The cottage and the truth",
      place: "Lisbon, Portugal",
      teaser: "A raised voice on the mezzanine — pass 1 learn-path quiz in Europe at 90%.",
      unlock: { type: "steps", cid: "eu", n: 1 },
      suspect: { wren: 1 },
      body: "A porter who had been stacking chairs under the mezzanine told the police, and then, because Mira asked quietly, told Mira too.\n\nAbout twenty minutes before the dinner bell, he had heard two voices above him. One was Elena's. He knew it because she had thanked him, by name, every morning. The other was younger, tight, trying not to cry and not quite managing.\n\n\"You cannot just bury it in the cottage and call it family,\" the younger voice said.\n\n\"I am not burying it,\" Elena said. \"I am ending it. Tomorrow, in front of them, I am going to tell the truth.\"\n\nA chair scraped. Someone went down the back stairs, fast. The porter did not see a face. He did see, a little later, Wren Voss on the sidewalk, putting her hands in her hair as if she could hold her head on.\n\nWren told the officers she had argued with her great-aunt about a cottage near Rosario — an inheritance, a delay, nothing that would matter to anyone else. She had gone out for air. She had not gone back up.\n\nPriya drew a box around tomorrow and the truth and wrote, in the margin, Which truth. An inheritance is one kind. A lecture called How a Map Can Lie is another.\n\nMira believed Wren had been crying. She did not yet know whether that made Wren safer to trust, or only sadder to suspect."
    },
    {
      id: "eu-2",
      title: "A laptop in the glass",
      place: "Lisbon, Portugal",
      teaser: "Someone is at the edge of a photograph — pass 4 Europe learn-path quizzes at 90%.",
      unlock: { type: "steps", cid: "eu", n: 4 },
      suspect: { theo: 1 },
      body: "Jonah almost did not mention the picture. He had taken it before dinner, while the fellows were still laughing about the tram, and the police had already asked for everything on his card. He showed Mira anyway, on the little screen, pinched in close.\n\nThe map room was reflected in the glass of the courtyard door. Most of the reflection was lamps and the torn atlas, still in one piece in this earlier frame. In the corner, a person in a fellowship jacket was closing a laptop with one hand. The laptop sleeve had a small, ugly sticker of a red compass rose that had been peeled and stuck again, slightly crooked.\n\n\"That's Theo,\" Jonah said. \"He told Samira he was downstairs, checking the projector. I believed him. He has that useful face.\"\n\nTheo, when Mira asked, did not bristle. He smiled as if she had caught him at a kindness. \"I went back for a cable,\" he said. \"The projector was being difficult. I didn't want to bother Elena. She was working.\"\n\nIt was a good answer. It might even have been a true one, as far as the cable. Priya added a line to her log: Theo's location, two versions. Mira looked at the crooked compass rose and thought about people who could not leave a thing unadjusted."
    },
    {
      id: "eu-3",
      title: "The river in the wrong mouth",
      place: "Lisbon, Portugal",
      teaser: "The torn atlas page is not just a threat — score 90% on the Europe test.",
      unlock: { type: "test", cid: "eu" },
      suspect: { contact: 1 },
      body: "Priya was the one who placed the torn page, once the police allowed them a photograph of it. It was a 1910 plate of the West African coast, the kind of handsome lithograph Elena used when she wanted to show a beautiful mistake. Someone had inked a river mouth about forty miles from where the river actually meets the sea.\n\n\"It isn't vandalism,\" Priya said. She had the Open Meridian database open on her own laptop, the public version, the one the fellows were supposed to learn on. \"It's a match. Look. In the 'corrected shoreline' layer, the same river has been moved. The note says, 'Adjusts a known survey error, 1910 plate.' The note is dated last week. The login is just a string: om.edit.night.\"\n\nMira felt the smallest click, the sound of a fact sitting down beside another fact. Elena's lecture title had not been a metaphor she picked for its charm. She had been about to show them a lie that was already in their own files.\n\nJonah said, \"So whoever redrew the page wanted us to see the method. Or Elena did, and someone left it there after, like a joke.\"\n\n\"Or a confession,\" Priya said, \"that they thought we would never be able to read.\"\n\nMira wrote: The murder and the database may be the same work. A map can be a weapon if the weapon you need is a new, official truth."
    },
    {
      id: "af-1",
      title: "The crate off Dakar",
      place: "Dakar, Senegal",
      teaser: "A photograph of a crate, and a coastline that does not agree — pass 1 learn-path quiz in Africa at 90%.",
      unlock: { type: "steps", cid: "af", n: 1 },
      suspect: { contact: 1 },
      body: "Elena's Africa packet was thinner than Mira expected: a photograph, a printed coastline, and a note in Elena's tight handwriting. The photograph showed a wooden crate on a bright dock, the sea behind it a hard, working blue. The stencil on the crate was a string of coordinates and the words OPEN MERIDIAN — EDUCATIONAL SCANS. The printed coastline was labeled, in the same stencil style, as the stretch of shore those coordinates were supposed to name.\n\nThe coordinates did not land on that shore.\n\nMira checked them twice, then handed the page to Priya, who checked them a third time with a patience that looked like anger. The point sat well inland, in a place that was not a port and had never been one. If you trusted the crate, a box of \"educational scans\" had been packed beside the Atlantic. If you trusted the numbers, the box had been invented somewhere else and given a seaside alibi.\n\nJonah, who had grown up with a real harbor, looked at the photograph for a long time. \"That's the port at Dakar,\" he said. \"The crane in the back is real. The numbers are the part that is lying.\"\n\nMira copied the coordinates into her notebook and wrote, underneath: A crate can travel honestly once the map has already cheated."
    },
    {
      id: "af-2",
      title: "The bronze with the wrong hometown",
      place: "Lagos, Nigeria",
      teaser: "A conversation about a piece that was listed in the wrong country — pass 4 Africa learn-path quizzes at 90%.",
      unlock: { type: "steps", cid: "af", n: 4 },
      suspect: { samira: 1 },
      body: "The second thing in the packet was not a document. It was the name of a person and a café in Lagos, and a line from Elena: Ask her what I asked her. She will remember.\n\nJonah knew the café. He did not know the woman, a collections assistant who had spent a year on a digitizing project with Open Meridian and then left, tired. She agreed to a call. On the screen she was kind, and then she was precise.\n\n\"Your founder asked me about a bronze head,\" she said. \"Not the famous ones everyone already argues about. A smaller piece, listed in a catalog as excavated in a country I will not name on this call, because the listing is the problem. Elena had a field note — an older one, from a colleague — that put the find-spot in a different country entirely. She wanted to know if I had ever seen the object in the scan queue. I had. The metadata had already been 'cleaned.' That was her word, not mine.\"\n\n\"Cleaned by whom?\" Mira asked.\n\n\"By the project,\" the woman said. \"By whoever had the password. I told her I did not want to be in the middle of it. She said she was sorry, and that she would take me out of the middle, and that she would put me back into the story only if she could do it safely. That was in May.\"\n\nJonah sat with his hands flat on the table after the call ended. \"So it isn't only rivers,\" he said.\n\n\"No,\" Mira said. \"It's objects. The map is how they get a new hometown.\""
    },
    {
      id: "af-3",
      title: "If the coordinates were honest",
      place: "West African coast, in the file",
      teaser: "An email Elena never sent — score 90% on the Africa test.",
      unlock: { type: "test", cid: "af" },
      suspect: { contact: 1 },
      body: "In a drafts folder Samira finally agreed to open, with a lawyer on the phone and the fellows sitting very still, they found an email Elena had not sent. The subject line was one word: Proof.\n\nThe body was shorter than Mira had imagined a life's last argument would be.\n\nIf the lagoon coordinates were honest, the export papers would fail. That is the whole trick. You do not have to smuggle a crate past a person if you can smuggle a coastline past a database. I have three mismatched sites now — the West African river, the inland point on the Dakar crate, and the bronze. I will show the fellows the 1910 plate tomorrow and then I will show them our own layer. I would rather be wrong in public than quiet in private.\n\nThe email was addressed to Samira. It was dated the morning of the welcome day. It had never left the drafts.\n\nSamira's face did not move much. \"I did not see this,\" she said. \"If I had, I would have asked her to wait. That is what I kept asking her anyway.\"\n\nPriya, who believed in paper, pointed at the unsent stamp as if it were a fingerprint. \"Someone who could open her laptop could have kept it here,\" she said. \"Or she simply hesitated. People hesitate.\"\n\nMira wrote both possibilities down. She also wrote the sentence she could not stop hearing: You do not have to smuggle a crate past a person if you can smuggle a coastline past a database."
    },
    {
      id: "sa-1",
      title: "A project code in Santos",
      place: "Santos, Brazil",
      teaser: "A bill of lading with the fellowship's own code on it — pass 1 learn-path quiz in South America at 90%.",
      unlock: { type: "steps", cid: "sa", n: 1 },
      suspect: { luca: 1 },
      body: "The South America packet held a bill of lading, stamped and ordinary, for a crate leaving the port of Santos. The cargo was described as glazed tiles, educational, no commercial value. The consignee was a cultural consultancy whose name Mira did not recognize. In a box at the bottom, like a courtesy, was a project code: OM-ELENA-7.\n\n\"That is ours,\" Samira said, too quickly. \"We use it for loaned scanners. We do not use it for tiles.\"\n\nLuca had gone paler than the paper. He knew the forwarding company. Of course he did. His uncle's firm handled a slice of the Mediterranean end of several South American lines, and Luca had spent summers learning the difference between a typo and a lie on a form like this one.\n\n\"I didn't book this,\" he said. \"I would tell you if I had. I know what it looks like that I'm the one who knows what it is.\"\n\nIt did look like that. Jonah, usually the one who made a joke in a heavy room, did not. Priya asked Luca whether his uncle's firm was on the document. It was, as a later handler, not as the origin. That was either a thin kind of innocence or a careful kind of cover.\n\nMira watched Luca's hands. They were shaking, which can mean guilt, and can mean the horror of being the shape a mystery wants. She wrote: Luca knows how crates move. That is a skill. It is not yet a confession."
    },
    {
      id: "sa-2",
      title: "Four hundred kilometers of paper",
      place: "Patagonia, in the record",
      teaser: "A field site that later moved — pass 4 South America learn-path quizzes at 90%.",
      unlock: { type: "steps", cid: "sa", n: 4 },
      body: "Elena had done fieldwork in Patagonia years ago, before Open Meridian had a logo. The packet included her original log: a site on a wind-scraped coast, a sketch of a headland, a longitude written twice, once in pencil and once, darker, as if she had checked it with cold fingers.\n\nIn the current database, the same site number sat four hundred kilometers away.\n\nThe correction note was cheerful. Improves alignment with later satellite shoreline. om.edit.night, again. The date was in April, two months before Lisbon.\n\n\"She would have noticed,\" Wren said. It was the most she had said in a day. \"She remembered numbers like other people remember birthdays. If someone moved her own site, she would have felt it like a hand on her shoulder.\"\n\nMira believed that. She also believed, looking at the cheerful note, that the editor had wanted the change to look like competence. A four-hundred-kilometer improvement. A gift to accuracy. The kind of gift that, if you accepted it, would put any object tied to that site in a completely different jurisdiction.\n\nPriya measured the distance on a clean map, as if the number might shrink if she were polite about it. It did not shrink.\n\n\"So this started before we arrived,\" Mira said. \"Lisbon wasn't the beginning. It was the moment Elena decided to say the beginning out loud.\""
    },
    {
      id: "sa-3",
      title: "Look at the longitudes",
      place: "A postcard from the south",
      teaser: "A message Elena sent to Wren — score 90% on the South America test.",
      unlock: { type: "test", cid: "sa" },
      suspect: { wren: 2 },
      body: "Wren produced the postcard only after Samira asked, gently, whether Elena had written to her from the last trip south. Wren had been carrying it in a book, as if a postcard could be hidden by standing it next to words.\n\nThe picture was a cheap, too-blue glacier. On the back, in Elena's hand:\n\nIf I don't come back from the south, look at the longitudes, not the stories. The cottage can wait. You will be angry with me for a while. Be angry, and then be exact. — E.\n\nIt had been mailed in May, from Punta Arenas, and it had arrived at Wren's apartment late, after Wren was already in Lisbon. Wren had not shown it to the police at first because, she said, it sounded like a woman expecting an accident, and she could not stand the way that would be interpreted.\n\n\"It sounds like she knew she was in danger,\" Jonah said.\n\n\"It sounds like she knew I thought she was hiding a family secret in a house,\" Wren said, and her voice frayed. \"I did think that. I told her so, on the mezzanine. I had the wrong secret.\"\n\nMira read the card again. Look at the longitudes, not the stories. It was advice, and it was a method, and it was, if you wanted it to be, a will. It made Wren look worse until you noticed that Elena had trusted her with the method. People do not usually mail a key to the person they expect will use it against them.\n\nMira wrote that down too, because wanting Wren to be cleared was also a kind of bias, and she was trying to notice her own."
    },
    {
      id: "na-1",
      title: "The permit in the packet",
      place: "Mexico City, Mexico",
      teaser: "A shipping document Samira did not explain — pass 1 learn-path quiz in North America at 90%.",
      unlock: { type: "steps", cid: "na", n: 1 },
      suspect: { samira: 1 },
      body: "The North America packet had been routed, according to Elena's label, through a map library in Mexico City that had once lent her a 19th-century chart of the Gulf. Inside, under a library slip, was a copy of a shipping permit on Open Meridian letterhead, signed with Samira's tight, handsome signature.\n\nLuca read it first, because they all looked at him when the words \"port authority\" appeared. He frowned. \"This isn't a standard release,\" he said. \"Or it isn't only a release. There's a reference number that doesn't belong on a teaching-scan form.\"\n\nSamira did not pretend she had never seen it. \"I signed it,\" she said. \"I did not put it in Elena's packet. If she copied it, she copied it because she did not trust me. I had given her a reason not to. I would not tell her, for two weeks, what the number was for.\"\n\n\"What was it for?\" Mira asked.\n\n\"I will tell you when I can prove it helped,\" Samira said, which was a sentence with a door in it, and the door was closed.\n\nPriya, who disliked closed doors, photographed the page. Mira watched Samira's face and thought of all the ways a careful adult can look guilty when she is trying, too quietly, to be useful."
    },
    {
      id: "na-2",
      title: "Hold, do not release",
      place: "Veracruz, Mexico",
      teaser: "The permit is not what it looked like — pass 4 North America learn-path quizzes at 90%.",
      unlock: { type: "steps", cid: "na", n: 4 },
      suspect: { samira: 2 },
      body: "The reference number, once Priya followed it with a patience that used three languages and one very polite email to a clerk in Veracruz, was not a release at all.\n\nIt was a hold.\n\nSamira had written to a customs acquaintance: Please delay this crate for inspection. Educational markings may be incorrect. I will send supporting documents. Do not release to the named consultancy without me.\n\nThe crate was the same one from the Santos bill of lading, or a twin with the same project code. It had not yet been released. It was sitting, Samira said, in a warehouse that was ugly and safe.\n\n\"I did not tell Elena because I did not have the documents yet,\" Samira said, and for the first time her voice had an edge of ordinary frustration, the kind that belongs to people who are used to being competent. \"I told her to wait. She thought I was protecting the project. I was protecting the crate from leaving. Those can look like the same delay from the outside.\"\n\nJonah let out a breath he seemed to have been holding since Lisbon. \"So you're not—\"\n\n\"I am not a thief,\" Samira said. \"I am a person who tried to stop a theft with a form, and a person who arrived too slow to stop something worse.\"\n\nMira believed her, mostly. She also knew that a hold letter could be a piece of theater, if you needed one. The warehouse, at least, could be checked. Samira gave them the number without being asked a second time."
    },
    {
      id: "na-3",
      title: "A half-finished case",
      place: "On the record, after the hold",
      teaser: "Samira finally talks — score 90% on the North America test.",
      unlock: { type: "test", cid: "na" },
      suspect: { samira: 3 },
      body: "Once the hold was real — confirmed, photographed, boring as a miracle — Samira sat down with the fellows and told the part she had been carrying alone.\n\nShe had suspected, since early spring, that someone inside Open Meridian was altering coordinates. She had not known who. The night logins used a shared-looking string. The changes were small enough to pass as scholarship and large enough, in the right places, to launder a find-spot. She had asked Elena to wait until a crate could be stopped and a login could be tied to a person. Elena had agreed, and then, in Lisbon, had decided that waiting was its own kind of lie.\n\n\"I was near the building because I was coming to stop the lecture,\" Samira said. \"Not to stop her forever. To ask for one more day. I was too late for the stairs. I will not pretend that looks pretty.\"\n\nIt did not look pretty. It looked, Mira thought, like a person who had made a cautious plan in a world that had stopped being cautious.\n\n\"If you suspected someone,\" Priya said, \"you have a list.\"\n\nSamira's eyes went to the table, not to a face. \"I have a list of people with the ability,\" she said. \"Ability is not proof. I will not hand you a name so you can be cruel with it. Bring me a login that belongs to a person, and I will help you make it loud.\"\n\nMira wrote: Samira is probably not the hand. She may still be the person who knows where the hand had to stand."
    },
    {
      id: "as-1",
      title: "A receipt in a narrow sea",
      place: "Singapore",
      teaser: "A café bill from a week Elena was not traveling — pass 1 learn-path quiz in Asia at 90%.",
      unlock: { type: "steps", cid: "as", n: 1 },
      suspect: { theo: 1, contact: 2 },
      body: "The Asia packet smelled faintly of the paper Elena liked, the kind that takes ink without bleeding. Inside was a café receipt from a place near the Singapore River, timed for a late afternoon eight days before the fellowship began. The order was two coffees. The card was a prepaid one. Tucked behind the receipt was a handwritten line in Elena's script: He said he was in Vancouver, finishing the build.\n\nThere were not many he's in the fellowship who were supposed to be in Vancouver that week, finishing a build.\n\nTheo, asked later, in a courtyard that was trying very hard to be ordinary, did not deny the city. \"I was in Singapore for a day,\" he said. \"A cousin. I didn't put it on the group form because it wasn't group business. I paid cash for most of it. I don't know this receipt.\"\n\nThe receipt did not have his name. It had a time, a place, and Elena's suspicion, which was not the same as a proof, and was also not nothing.\n\nMira looked up the café on a map because she could not help it. It sat close to a famous narrow sea, a place where a huge share of the world's shipping has to pass. A good city, she thought, if you needed to talk about crates without looking like you had traveled to talk about crates.\n\nPriya clipped the receipt into the case file and wrote, very small: Two coffees is a meeting, not a cousin's house."
    },
    {
      id: "as-2",
      title: "The man who was not on the list",
      place: "Singapore",
      teaser: "A frame from a hotel camera — pass 4 Asia learn-path quizzes at 90%.",
      unlock: { type: "steps", cid: "as", n: 4 },
      suspect: { theo: 2, contact: 2 },
      body: "Elena had not stopped at the receipt. She had, somehow, gotten a still from a hotel corridor camera — Mira did not ask how, and Samira, reading the letter that came with it, looked as if she might ask later, in a more official voice. The still was grainy and enough.\n\nTheo was in it. He was wearing a shirt Mira recognized from a pre-trip group photo, the one where he had stood a little to the side. He was shaking hands with a man who was not on any fellowship list. The man was older, tidy, and carrying a slim folder, not a suitcase. The timestamp matched the café receipt's afternoon, two hours later.\n\nJonah said, \"That's not a cousin.\"\n\n\"No,\" Mira said.\n\nTheo, when they showed him a copy and not the original, went very still, which is a different expression from a useful smile. \"He's a donor contact,\" he said. \"He wanted a tour of the scan pipeline. I shouldn't have taken the meeting off the books. I know how it looks, with everything else. I was trying to be helpful.\"\n\nHelpful, again. Priya underlined donor contact and wrote a question mark so heavy it almost tore the page. Mira thought of Elena flying, or writing, or asking a favor of a hotel, eight days before a lecture she would not live to give, because she already knew the map was being bent and wanted a face to put beside the bend.\n\nThe man in the folder had no name in the packet. Elena had written only: He buys certainty. He does not make it. Someone inside makes it for him."
    },
    {
      id: "as-3",
      title: "Two-thirteen in the morning",
      place: "The file metadata, Lisbon time",
      teaser: "A timestamp that does not belong to the living — score 90% on the Asia test.",
      unlock: { type: "test", cid: "as" },
      suspect: { theo: 3 },
      body: "Priya did not sleep much the night she learned to read the unglamorous part of a file: the metadata, the save times, the true login hiding under the shared-looking string.\n\nom.edit.night, in three of the most important corrections — the West African river, a Mekong shoreline, a note on the Malacca approaches — resolved to a user who had been issued a quiet admin right in March: theo.park.\n\nThe last of those saves was at 2:13 a.m., Lisbon time, the night Elena died.\n\nElena's time of death, as the officials had been willing to say, was earlier than that. Not much earlier. Early enough.\n\n\"So he was in the files after she was gone,\" Jonah said. He did not joke.\n\n\"He was in the files,\" Priya said, \"while the rest of us were answering questions downstairs, or trying to. He told me, that night, that he was backing things up so nothing would be lost. That may even have been true. You can back a thing up and also move a river while you are there.\"\n\nMira thought of Theo offering, immediately, to take care of the laptops. She thought of the reflection in Jonah's photograph. She thought of a handshake in a Singapore corridor. None of these, alone, is a court. Together they were a shape. The shape had a name, and the name had been sitting with them at breakfast, offering to fix the Wi-Fi.\n\nShe did not say it out loud yet. She wrote it, because writing was how she kept herself from running: Theo had the access, the meeting, and the 2:13 a.m. save. If he has an honest story for all three, it will have to be a very good one."
    },
    {
      id: "us-1",
      title: "A warehouse with a California invoice",
      place: "Near Los Angeles, California",
      teaser: "An invoice in a packet meant for a university archive — pass 1 learn-path quiz in U.S. States at 90%.",
      unlock: { type: "steps", cid: "us", n: 1 },
      body: "Elena had planned a United States stop not as a tourist day but as a visit to a university map archive, and, apparently, as a visit to an invoice she had not been meant to see. The packet held a copy of a storage bill for a unit on the edge of Los Angeles, paid by the same cultural consultancy that had appeared on the Santos form. The listed contents were \"paper surveys and teaching models.\" The pickup contact, in a rushed hand, was a set of initials: T.P.\n\nT.P. is more than one person in a large country. T.P. is not that many people in a small fellowship.\n\nMira, who had grown up a day's travel up the same coast, felt the strange closeness of a case stepping onto familiar highways. She called the archive, not the warehouse. A librarian Elena had trusted said yes, Elena had written ahead, and yes, Elena had sounded angry in the careful way of someone trying not to sound angry at a librarian.\n\n\"She said she needed a copy of her first book from our stacks,\" the librarian said. \"And she said, if anything happened to her travel plans, I should tell a student named Mira to look in the margins. I thought she meant delayed flights.\"\n\nMira wrote her own name down as if it belonged to someone else. Elena had expected her, specifically, to keep reading. That was either faith or a terrible assignment. It was probably both."
    },
    {
      id: "us-2",
      title: "Approved by login",
      place: "A U.S. customs form, copied",
      teaser: "A 'scan correction' with a name on it — pass 4 U.S. States learn-path quizzes at 90%.",
      unlock: { type: "steps", cid: "us", n: 4 },
      suspect: { theo: 3 },
      body: "Under the invoice was a customs form, or a photocopy of one, for a shipment of \"digitized survey plates\" entering the United States earlier in the spring. Most of it was dull. One field was not.\n\nA box labeled technical verification had been signed, electronically, with the login theo.park, and a note: scan correction complete; coordinates aligned to approved layer.\n\nSamira stared at it as if the letters might rearrange themselves into a nickname she could live with. They did not.\n\n\"Admin rights,\" she said, almost to herself. \"I told the board we needed a second pair of eyes on admin rights. I did not pull his. He was good at the work. He was the person who stayed late.\"\n\nLuca, who had been living under the suspicion of bills of lading, let out a laugh that was not amused. \"So the helpful one signs the helpful box.\"\n\nTheo was not in the room. Theo was, Samira said, in the courtyard, fixing a connection. Of course he was.\n\nMira did not go to the courtyard. She sat with the form and felt the case tighten, not with drama, with paperwork, which is how a lot of true things tighten. A person can smile and still be a signature. A person can offer to clean a file and mean it in more than one way."
    },
    {
      id: "us-3",
      title: "A note in the margin",
      place: "A university map archive, California",
      teaser: "Elena left a line in her own first book — score 90% on the U.S. States test.",
      unlock: { type: "test", cid: "us" },
      suspect: { theo: 3 },
      body: "The librarian sent photographs, and then, because Mira asked and because Elena had used Mira's name, a short video of the title page of Elena's first book, a worn copy, the one the archive held.\n\nIn the margin, in the same tight hand as the packets, Elena had written, recently enough that the ink looked a little darker than the rest of her old notes:\n\nT.P. should not have admin. If I am wrong, I will apologize to him in front of the students and I will mean it. If I am right, the corrections will have his hours in them. Do not let a polite person be the whole proof. Let the hours be the proof.\n\nMira played the video twice. Jonah, behind her, said something soft in a language that might have been a prayer or a swear.\n\nPriya closed her contradiction log for a moment, which she almost never did, and then opened it again and wrote the sentence in full, because a margin is a kind of document and she would not be the person who only remembered the vibe of it.\n\nWren put her palm on the table, gently, as if the table were a shoulder. \"She was going to apologize if she was wrong,\" Wren said. \"That is so like her I could scream.\"\n\nMira thought of Theo's useful face. She thought of Elena trying, even in a margin, to be fair. Fairness is a kind of north. Someone had been moving it, a few degrees at a time, for months."
    },
    {
      id: "oc-1",
      title: "A survey that never went ashore",
      place: "Vanuatu, in the catalog, not on the beach",
      teaser: "A Pacific find-spot with no field trip behind it — pass 1 learn-path quiz in Oceania at 90%.",
      unlock: { type: "steps", cid: "oc", n: 1 },
      suspect: { contact: 1 },
      body: "The Oceania packet held a catalog card for a carved object listed as \"surveyed in Vanuatu,\" with a tidy grid reference and a date. Elena had stapled it to a second page: the travel log for Open Meridian for that month. There was no field trip to Vanuatu. There was a warehouse upload from a staff account, and a correction, two days later, making the grid reference even tidier.\n\n\"They didn't even pretend to buy a plane ticket,\" Jonah said.\n\n\"They didn't need to,\" Priya said. \"If the catalog already says Vanuatu, the object has a legal-looking childhood. The upload is just a birth certificate issued after the fact.\"\n\nElena's note at the bottom was almost dry. Pacific 'survey errors' are in fashion this year. If a dealer needs a soft origin, an island with a complicated record is a useful kind of fog. Check whether we have been the fog.\n\nMira, who had been thinking of rivers and bronze and Patagonia, felt the case stretch to its true size. It was not one region. It was a method you could lay over any coast people far away would not personally walk. The fellowship had been invited to love maps. Someone had used that love as cover, and used their database as a typewriter for new origins.\n\nShe wrote: The world is not the lie. The labels are."
    },
    {
      id: "oc-2",
      title: "The crooked compass rose",
      place: "A group photograph, then the packet",
      teaser: "A sticker that keeps showing up — pass 4 Oceania learn-path quizzes at 90%.",
      unlock: { type: "steps", cid: "oc", n: 4 },
      suspect: { theo: 2, luca: 1 },
      body: "Jonah had printed the Lisbon reflection large, because Mira had asked, and because he was the kind of person who would rather spend money on paper than on not knowing. In the Oceania packet, as if Elena had been collecting the same kind of noticing, there was a second photograph: the fellows at the airport, earlier, tired and bright. Theo's laptop sleeve was in this one too, under his arm, the red compass rose sticker already crooked.\n\nA porter had told the Lisbon police that the person who went back up the mezzanine stairs, after Wren came down, had been slight and had been carrying a dark sleeve with a mark on it. The porter had not been sure of the mark. A red flower, maybe. A wheel. He had not been looking for a clue. He had been looking for whether the person needed the elevator.\n\n\"A flower or a wheel,\" Jonah said, tapping the sticker, \"is a compass rose if you have already seen it once.\"\n\nIt was not a locked-room proof. It was a thread. Luca, who also owned a dark bag, put his bag on the table without being asked, and it was a bag, and it was empty of stickers, and Mira was grateful for the ugliness of that little moment, the way a frightened person will turn out their pockets.\n\nTheo's sleeve was still on Theo's chair, in the work room. Nobody took it. Nobody needed to. Jonah already had the picture, and Elena had had it too."
    },
    {
      id: "oc-3",
      title: "The ink that was not from the shop",
      place: "Lisbon, in the lab kit",
      teaser: "The brown line on the atlas has a supply closet behind it — score 90% on the Oceania test.",
      unlock: { type: "test", cid: "oc" },
      suspect: { luca: 3, theo: 3 },
      body: "Luca had, in a burst of miserable helpfulness, admitted that he bought a handful of cheap brown pens at a stationery shop near the tram, the first day, because Elena had said the fellows should mark printed copies and not the originals. The police had liked that fact. Anyone would. A brown line, a brown pen, a boy who knew about crates.\n\nElena, who planned like a person who had been disappointed by easy stories before, had left in the Oceania packet a last dry gift: a photo of the Open Meridian lab kit inventory, checked out the morning of the welcome day. One bottle of archival ink, the brown that conservators use when they want a line to look old and stay put, had been signed out on Theo's staff code. A note in Elena's hand, clipped to the photo, said: If they tell you it was a shop pen, ask whether a shop pen would sit on the paper like this. Then ask who was allowed to open the kit.\n\nPriya, who did not claim to be a chemist, still knew enough to see that the line on the torn page had a slightly different sheen, in the police photograph, than Luca's leftover shop pens, which he had handed over as if they were burning him.\n\n\"I wanted it to be me,\" Luca said, weirdly, \"if it would make the rest of this stop. It isn't me. I hate that that's a relief.\"\n\nMira hated that it was a relief too, and then she let the relief be exact, the way Elena had asked. The ink belonged to the lab. The lab checkout belonged to Theo. The shop pens were a story that had almost worked."
    },
    {
      id: "end-1",
      title: "The board, laid out",
      place: "The case file, complete enough",
      teaser: "The last folders open when every region's test has been passed at 90%.",
      unlock: { type: "finale" },
      suspect: { wren: 3, luca: 3, samira: 3, theo: 3, contact: 2 },
      body: "Mira laid the clues out the way Elena might have laid out a set of plates: not in the order the fellows had opened them, but in the order a careful person would want to be convinced.\n\nElena had been about to show the fellowship a lying map that was already in their files. The same method had been used on a West African river, a Dakar crate, a bronze with a new hometown, a Patagonian site, and a Pacific object that had never seen the beach it was born on, on paper.\n\nSamira had been trying to hold a crate, not steal one. Wren had the wrong secret and the right grief, and she had gone down the stairs, not up. Luca knew ports and owed an ordinary debt and had bought the wrong pens.\n\nTheo had been in the map room when he said he was not. Theo had admin he should not have kept. Theo had shaken hands with a man who bought certainty in Singapore, on a day he had claimed to be in Vancouver. Theo had signed a U.S. correction, checked out the archival ink, and saved a file at 2:13 a.m., after Elena was already gone, under a login that only looked shared.\n\nElena had written Mira's name in a librarian's ear and T.P. in a margin, and had still, even then, left room to apologize if she was wrong.\n\nShe had not been wrong.\n\nJonah sat back. \"So we tell Samira, and she tells someone with a badge, and we don't do anything cinematic in a stairwell.\"\n\n\"Yes,\" Mira said. \"We do it like a map. We do it with the hours.\""
    },
    {
      id: "end-2",
      title: "The useful face",
      place: "A courtyard, then a closed room",
      teaser: "Locked until the last chapters open.",
      unlock: { type: "finale" },
      body: "They did not confront him on a mezzanine. Samira, who had wanted a login that belonged to a person, took the file to the people who could do something official, and then she asked Theo into a closed room that had once been used for tea.\n\nMira was not there for all of it. She was there for the beginning, because Samira said Elena would have wanted a student to see that this was not a story about being clever in the dark. It was a story about being exact in the light.\n\nTheo did not, at first, put on a villain's expression. He looked tired, and young, and still faintly helpful. Then the hours were read to him, and the Singapore still was placed on the table, and the helpfulness thinned.\n\nHe said the dealer had found him first, which might have been true. He said he had thought, for a week or two, that he would be a whistleblower, which might also have been true, and was not a defense if you stay for the paycheck. He said Elena had seen him in the files and had told him, that afternoon, that the lecture would include his login if he did not come to her before morning. He said he had gone up to ask her to wait. He said he had not meant for the stairs to be the end of the conversation.\n\nMira did not want the details of the stairs. Nobody in the room asked for them. The official version would be careful again, and short, and enough.\n\nHe tried, once, to slide the worst of it toward Samira, and then toward the man in Singapore. Samira did not take it. The man in Singapore, when he was later named, was a buyer. He had not been in the map room. The person who knew how to lie with a map, and who had been trusted to keep the maps, had been.\n\nTheo looked at Mira, of all people, as if she might still need a cable fixed. She did not."
    },
    {
      id: "end-3",
      title: "True north",
      place: "Afterward",
      teaser: "Locked until the last chapters open.",
      unlock: { type: "finale" },
      body: "The crate in Veracruz did not leave. The coordinates, slowly, with a lot of boring, necessary work, were put back. Some objects would have longer legal stories than a fellowship could finish. That was right. Students are not a court.\n\nWren went to the cottage eventually, and it was only a cottage. She wrote Mira a letter that was mostly about the weather and, in one line, about how anger and exactness can live in the same month. Luca's sister stayed in school. Jonah took fewer pictures of people who were not ready to be taken. Priya started a new notebook that was not only contradictions; the first page was a list of things that had, after all, matched.\n\nSamira renamed the summer program. She did not put anyone's death in the title. She put, instead, a small north arrow on the letterhead, the kind you have to check.\n\nMira went home to Santa Cruz in August with a box of copies and a tan line from a summer that had not been the summer she had packed for. On the last night, in a borrowed workroom, she had helped a younger student fix a map for a class, and the student had drawn the north arrow by eye, close enough, almost handsome.\n\n\"Wait,\" Mira had said, and she had said it kindly. They checked it together. It was two degrees off.\n\nThey redrew it.\n\nMira thought of Elena, and of the person who had been holding the pen, and of the difference, which is the whole work: a map is a promise about the world. If someone moves the promise, you do not have to raise your voice, at first. You have to notice. Then you have to say so, in front of other people, before the lie has a chance to look official.\n\nShe wrote that down, too, and then she closed the case file, not because the world was finished, but because this part of it, at least, was true."
    }
  ]
};

if (typeof module !== "undefined") module.exports = MYSTERY_DATA;
else window.MYSTERY_DATA = MYSTERY_DATA;
