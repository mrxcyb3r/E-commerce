export interface ClothingPromptItem {
  id: string;
  title: string;
  category: "Men" | "Women" | "Kids & Baby" | "Schoolwear" | "Sportswear" | "Seasonal & Campaigns";
  subcategory: string;
  productType: string;
  description: string; // What is this?
  useCase: string; // When should I use it & what will I get?
  prompt: string; // Complete, copy-ready AI instruction
  aspectRatio: "4:5" | "9:16" | "1:1" | "16:9";
  difficulty: "Beginner" | "Intermediate";
  tags: string[];
}

export const CLOTHING_PROMPT_LIBRARY: ClothingPromptItem[] = [
  // =========================================================================
  // 1. MEN'S CLOTHING
  // =========================================================================
  {
    id: "men-tee-001",
    title: "Tashkent Streetwear — Oversized T-Shirt",
    category: "Men",
    subcategory: "T-Shirts",
    productType: "Oversized T-Shirt",
    description: "Transform an ordinary photo of an oversized T-shirt into a gritty, high-fashion urban streetwear shot.",
    useCase: "Best for Instagram feed (4:5) and Telegram channel drops. Delivers a modern urban look on a Tashkent city street.",
    prompt: `Analyze the uploaded product image carefully before generating. Treat the uploaded garment as the exact product being sold. Preserve its original cut, oversized boxy silhouette, fabric weight, cotton texture, exact color tone, neckline ribbing, dropped shoulders, and any graphic prints or typography exactly as shown. Do not alter, replace, recolor, or invent new graphics.

Scene: A young Central Asian male model with modern short fade hair, standing on a stylish pedestrian street in modern Tashkent near contemporary concrete and glass architecture.
Pose: Natural, relaxed streetwear posture, hands in cargo pant pockets, looking slightly away from the lens.
Styling: The uploaded T-shirt is the centerpiece, paired with relaxed wide-leg dark grey cargo trousers and minimal retro sneakers.
Lighting: Soft golden-hour directional sunlight mixed with cool open-sky fill light, creating crisp fabric textures and natural micro-shadows.
Camera: Canon EOS R5, 85mm f/1.8 lens, shallow depth of field with beautifully blurred modern urban background. Clean, ultra-realistic commercial fashion shot.
Orientation: 4:5 vertical portrait framing.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "t-shirt", "oversized", "streetwear", "tashkent", "instagram", "urban"]
  },
  {
    id: "men-tee-002",
    title: "Minimal Studio — Basic T-Shirt Catalog",
    category: "Men",
    subcategory: "T-Shirts",
    productType: "Basic Crewneck T-Shirt",
    description: "Clean, high-end ecommerce catalog photography on a neutral studio background.",
    useCase: "Best for marketplace product cards (Uzum, Wildberries, website catalog). Delivers ultra-clean, distraction-free product focus.",
    prompt: `Carefully inspect the uploaded garment image. The uploaded T-shirt must be preserved exactly as presented: match its exact neckline shape, sleeve length, hemline finish, color swatch, fabric sheen, and cotton-poly weave. Do not redesign, recolor, or change proportions.

Scene: High-end commercial fashion studio with a smooth, warm light-grey cyclorama backdrop.
Model: A fit male model standing straight, shoulders relaxed, one hand lightly resting at hip level.
Styling: The uploaded basic T-shirt fitted naturally on the model's torso with realistic draping, paired with clean dark indigo raw denim jeans.
Lighting: Professional three-point studio softbox lighting. Diffused key light from 45 degrees, gentle fill, and subtle rim light to separate the model and garment cleanly from the backdrop.
Camera: Hasselblad H6D-100c, 90mm lens, f/8 for tack-sharp focus across every thread, seam, and fabric contour.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "t-shirt", "basic", "studio", "ecommerce", "catalog", "minimal"]
  },
  {
    id: "men-tee-003",
    title: "Graphic T-Shirt — High-Contrast Social Ad",
    category: "Men",
    subcategory: "T-Shirts",
    productType: "Graphic Printed T-Shirt",
    description: "Bold, eye-catching social media advertisement emphasizing the exact front print of the shirt.",
    useCase: "Best for Instagram Stories, Reels covers, and TikTok ads (9:16). Delivers high click-through visual impact.",
    prompt: `Examine the uploaded product photo with precision. The graphic artwork, typography, illustration, colors, distressing, and placement on the uploaded T-shirt must be reproduced 100% identically with zero hallucinations or AI-generated random text. Maintain the exact fabric dye and collar shape.

Scene: Modern industrial loft studio with exposed warm brick and ambient neon tube accent in the far background.
Model: Confident young man standing front-facing, slightly leaning back against an industrial metal railing.
Composition: 9:16 vertical composition framed from the mid-thigh up, with plenty of clean negative space at the top third for text overlays.
Lighting: Dramatic dual-tone lighting — neutral white key light hitting the front print cleanly for true-to-life color, with a subtle warm amber rim light along the shoulders.
Camera: 50mm f/2.0 portrait prime, crisp center sharpness, rich organic shadows.
Orientation: 9:16 vertical.`,
    aspectRatio: "9:16",
    difficulty: "Intermediate",
    tags: ["men", "t-shirt", "graphic", "reels", "story", "ad", "streetwear"]
  },
  {
    id: "men-tee-004",
    title: "Premium Heavyweight T-Shirt — Flat Lay Arrangement",
    category: "Men",
    subcategory: "T-Shirts",
    productType: "Heavyweight Cotton T-Shirt",
    description: "Symmetrical top-down flat lay with premium lifestyle accessories.",
    useCase: "Best for Instagram carousel slide #2, Telegram shop announcement, or minimalist brand lookbooks.",
    prompt: `Analyze the uploaded garment photo. Maintain the exact collar thickness, heavy cotton fabric structure, sleeve fold, accurate color shade, and any tags or woven labels visible on the uploaded T-shirt.

Scene: Direct 90-degree overhead top-down flat lay arrangement on a textured light beige limestone surface.
Composition: The uploaded T-shirt is neatly folded with open sleeves in the center. Tastefully accented with a minimalist silver wristwatch, matte black sunglasses, and a small luxury ceramic coffee saucer nearby.
Lighting: Crisp morning directional window light coming from the left, casting natural, realistic soft shadows under the shirt folds and collar.
Details: Pristine fabric clarity, visible heavyweight combed cotton weave, perfectly straight margins.
Orientation: 1:1 square.`,
    aspectRatio: "1:1",
    difficulty: "Beginner",
    tags: ["men", "t-shirt", "flatlay", "minimal", "square", "instagram", "accessories"]
  },
  {
    id: "men-shirt-005",
    title: "Linen Summer Shirt — Modern Tashkent Café",
    category: "Men",
    subcategory: "Shirts",
    productType: "Linen Casual Shirt",
    description: "Relaxed summer lifestyle photo of a linen shirt in an upscale modern outdoor café.",
    useCase: "Best for summer collection launches on Instagram and Telegram boutiques.",
    prompt: `Strictly inspect the uploaded linen shirt. Keep its exact button style, collar construction, slub linen texture, breast pocket (if present), cuff details, and authentic natural color. Do not turn it into a shiny synthetic fabric.

Scene: An upscale open-air terrace café in Tashkent (like Tarona or Chorsu modern boutique cafes), shaded by lush green plants and light wood pergolas.
Model: A stylish Central Asian man in his late 20s seated at a marble bistro table, holding an iced espresso glass, looking thoughtfully off-camera.
Garment Styling: The uploaded linen shirt is worn unbuttoned at the top two buttons, sleeves rolled loosely to the mid-forearm, paired with tailored ecru linen shorts.
Lighting: Dappled summer sunlight filtering through leafy trees, highlighting the airy, breathable weave of the linen.
Camera: 85mm f/1.4 prime lens, creamy bokeh background, high-end editorial lifestyle aesthetic.
Orientation: 4:5 vertical portrait.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "shirt", "linen", "summer", "lifestyle", "cafe", "tashkent"]
  },
  {
    id: "men-shirt-006",
    title: "Classic Formal Shirt — Executive Office Setting",
    category: "Men",
    subcategory: "Shirts",
    productType: "Formal Dress Shirt",
    description: "Crisp corporate executive look showing the shirt worn in a high-rise office.",
    useCase: "Best for formal wear shops, business collections, and corporate menswear promotions.",
    prompt: `Analyze the uploaded dress shirt thoroughly. Retain the exact collar shape (spread, point, or button-down), placket stitching, cuff button configuration, fabric sheen, and exact color hue.

Scene: High-floor modern corporate office in Tashkent City International Business Center, panoramic glass windows overlooking the skyline during early morning.
Model: Well-groomed male professional in his 30s standing near an executive walnut desk, adjusting a luxury cufflink.
Styling: The uploaded formal shirt is neatly tucked into tailored charcoal wool trousers with a sleek leather belt.
Lighting: Clean interior architectural light combined with cool morning daylight from the panoramic window, accentuating the crisp, wrinkle-free cotton poplin weave.
Camera: 70mm, f/4, crisp contrast, razor-sharp details on collar points and fabric stitches.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "shirt", "formal", "office", "executive", "business", "tashkent-city"]
  },
  {
    id: "men-polo-007",
    title: "Classic Piqué Polo — Modern Boutique Interior",
    category: "Men",
    subcategory: "Polo",
    productType: "Classic Polo Shirt",
    description: "Premium retail atmosphere highlighting the collar, buttons, and piqué waffle knit.",
    useCase: "Best for menswear boutique catalogs and Telegram channel weekly new arrivals.",
    prompt: `Preserve all aspects of the uploaded polo shirt: the collar ribbing, the 2 or 3 button placket, embroidered chest logo/patch (if any), sleeve cuffs, and original knit texture. Do not alter colors or branding.

Scene: Inside a luxury menswear boutique with minimalist oak shelving, warm recessed LED lighting, and polished concrete flooring.
Model: Confident male model leaning lightly against a sleek marble display island, arms crossed comfortably.
Styling: The uploaded polo shirt is worn fitted, paired with slim-fit beige chino trousers and clean leather loafers.
Lighting: Sophisticated commercial retail lighting with soft key light on the polo chest to showcase the rich piqué texture.
Camera: 50mm f/2.2, crisp commercial fashion photography, rich color balance.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "polo", "boutique", "smart-casual", "retail", "luxury"]
  },
  {
    id: "men-polo-008",
    title: "Zip-Collar Knit Polo — Luxury Hotel Lobby",
    category: "Men",
    subcategory: "Polo",
    productType: "Knit Zip Polo",
    description: "High-end luxury aesthetic capturing modern quiet luxury menswear.",
    useCase: "Best for premium fashion brands targeting upscale clientele in Uzbekistan.",
    prompt: `Analyze the uploaded knit polo. Preserve its exact zipper metal finish, ribbed hem, collar shape, fine-gauge knit structure, and exact tone.

Scene: Opulent modern hotel lobby with travertine stone walls, subtle architectural cove lighting, and minimalist art sculptures.
Model: Handsome gentleman sitting on a low designer leather armchair, one leg crossed over the other.
Styling: Uploaded knit polo worn smoothly, paired with tailored pleated off-white trousers.
Lighting: Soft ambient architectural lighting with a focused warm spotlight on the upper torso for dimensional depth.
Camera: Sony A7R V, 85mm f/1.8 lens, high dynamic range, pristine texture clarity.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Intermediate",
    tags: ["men", "polo", "knit", "luxury", "hotel", "quiet-luxury"]
  },
  {
    id: "men-pants-009",
    title: "Slim-Fit Denim Jeans — City Crosswalk Movement",
    category: "Men",
    subcategory: "Pants",
    productType: "Denim Jeans",
    description: "Dynamic walking motion shot emphasizing the fit, wash, and pocket construction of the jeans.",
    useCase: "Best for dynamic Instagram feed posts and denim brand promotion.",
    prompt: `Inspect the uploaded jeans carefully. Preserve the exact denim wash (whiskering, fading, distressing, or raw dark blue), pocket shape, rivets, contrast stitching, and leg taper. Do not change the fit or wash pattern.

Scene: Modern crosswalk on Amir Temur Avenue in Tashkent, dynamic urban background with clean modern city depth.
Model: Young adult male walking forward mid-stride, captured naturally in motion.
Styling: The uploaded jeans are the primary focus, paired with a simple tucked-in white t-shirt and white low-top leather sneakers.
Framing: Lower-body to mid-torso framing (waist to shoes) to give maximum visual priority to the jeans.
Lighting: Bright afternoon daylight with crisp ground shadows, highlighting the denim whiskers and seam construction.
Camera: Fast shutter speed (1/1000s), 50mm f/2.0 lens, crisp action capture with zero motion blur.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "pants", "jeans", "denim", "tashkent", "urban", "street"]
  },
  {
    id: "men-pants-010",
    title: "Tactical Cargo Pants — Urban Techwear Setting",
    category: "Men",
    subcategory: "Pants",
    productType: "Cargo Pants",
    description: "Edgy, utilitarian techwear shot focusing on cargo pocket utility and silhouette.",
    useCase: "Best for youth streetwear shops and Telegram drops.",
    prompt: `Analyze the uploaded cargo pants carefully. Lock all pocket placements, flaps, straps, zipper details, ankle cinch/drawstring style, and exact fabric color tone. Do not remove or add extra pockets.

Scene: Modern industrial concrete staircase and brutalist architectural background with sharp geometric lines.
Model: Male streetwear model in a dynamic low-angle standing pose, one foot elevated on a concrete step.
Styling: Uploaded cargo pants styled with a boxy black hoodie and technical trail running shoes.
Lighting: Cool directional lighting with sharp micro-shadows accentuating every flap, zipper, and pocket fold.
Camera: 35mm wide-angle lens, low-angle perspective to emphasize the silhouette and structure of the cargo pants.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Intermediate",
    tags: ["men", "pants", "cargo", "techwear", "streetwear", "urban"]
  },
  {
    id: "men-pants-011",
    title: "Classic Pleated Trousers — Premium Studio Showcase",
    category: "Men",
    subcategory: "Pants",
    productType: "Pleated Classic Trousers",
    description: "Sophisticated studio shot highlighting the drape, pleats, and tailoring of classic trousers.",
    useCase: "Best for formalwear shops, classic menswear brands, and bespoke tailors.",
    prompt: `Carefully examine the uploaded trousers. Preserve the exact pleat count (single or double pleat), waistband closure (side adjusters, belt loops, or button tab), crease line down the center of each leg, fabric drape, and hem cuff.

Scene: High-end editorial studio with a muted warm taupe textured canvas backdrop.
Model: Elegant male model standing in three-quarter profile, one hand gently resting in the trouser pocket.
Styling: The uploaded trousers draped naturally over polished oxfords, paired with a fine merino wool knit sweater tucked in.
Lighting: Soft directional strip softbox from the side to sculpt the front sharp crease line and fabric drape.
Camera: 90mm portrait prime, f/5.6, razor-sharp focus from waistband to shoe hem.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "pants", "trousers", "classic", "formal", "studio", "tailored"]
  },
  {
    id: "men-outer-012",
    title: "Leather Biker Jacket — Night City Atmosphere",
    category: "Men",
    subcategory: "Outerwear",
    productType: "Leather Jacket",
    description: "Moody, cinematic evening shot showcasing the leather grain and metallic hardware.",
    useCase: "Best for autumn/spring campaigns and premium outerwear drops.",
    prompt: `Analyze the uploaded leather jacket meticulously. Preserve the exact leather finish (matte, polished, or distressed), asymmetric zipper, lapel snap buttons, waist buckles, zipper pulls, and seam placement. Do not alter the cut or hardware.

Scene: Tashkent modern boulevard at dusk, with warm streetlights, glowing café signboards, and wet asphalt reflections.
Model: Charismatic male model standing near a modern glass storefront, hands casually touching the jacket lapels.
Styling: The uploaded leather jacket worn over a fitted black crewneck, paired with dark slim trousers.
Lighting: Cinematic neon and warm tungsten ambient street lighting, catching specular highlights on the leather grain and chrome zipper teeth.
Camera: 50mm f/1.4 lens, cinematic color grading, shallow depth of field.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Intermediate",
    tags: ["men", "outerwear", "leather-jacket", "night", "cinematic", "premium"]
  },
  {
    id: "men-outer-013",
    title: "Winter Puffer Jacket — Snowy Tashkent Park",
    category: "Men",
    subcategory: "Outerwear",
    productType: "Puffer Jacket",
    description: "Authentic winter outdoor campaign shot demonstrating warmth and loft.",
    useCase: "Best for winter season sales on Telegram channels and Instagram feeds.",
    prompt: `Carefully examine the uploaded puffer jacket. Lock in the exact baffle quilting pattern (horizontal, chevron, or grid), zipper/snap placket, hood construction, collar height, fabric finish (matte or gloss), and exact color.

Scene: Central Park Tashkent on a crisp snowy winter afternoon, with snow-covered pine trees and soft falling snowflakes in the air.
Model: Central Asian young man wearing the uploaded puffer zipped up to the chin, smiling gently, breathing light steam in the cold air.
Styling: The uploaded puffer jacket styled with a knitted winter beanie and dark warm joggers.
Lighting: Bright, diffused overcast winter daylight creating clean, true-to-life color reproduction without harsh glares.
Camera: 85mm f/2.0, crisp focus on the water-resistant nylon texture with delicate snowflakes resting on the jacket shoulders.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "outerwear", "puffer", "winter", "snow", "park", "warm"]
  },
  {
    id: "men-outer-014",
    title: "Classic Wool Palto / Overcoat — Architectural Editorial",
    category: "Men",
    subcategory: "Outerwear",
    productType: "Wool Coat / Palto",
    description: "High-fashion editorial campaign showing a structured wool coat against grand modern architecture.",
    useCase: "Best for luxury menswear lookbooks, billboards, and high-ticket autumn/winter catalogs.",
    prompt: `Analyze the uploaded wool coat / palto. Maintain the exact lapel width (notch or peak), double-breasted or single-breasted button configuration, wool felt texture, pocket welts, length (knee or calf), and exact color tone.

Scene: In front of the modern marble and glass facade of the Tashkent Congress Hall, grand architectural steps and dramatic clean lines.
Model: Tall, sophisticated male model walking down the steps, coat naturally unbuttoned and moving with subtle elegance.
Styling: The uploaded wool palto worn over a cream turtleneck sweater and tailored wool trousers with leather Chelsea boots.
Lighting: Crisp late-afternoon autumn sunlight casting long, elegant shadows across the architectural steps.
Camera: 70-200mm f/2.8 lens at 135mm, commercial luxury fashion editorial style.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Intermediate",
    tags: ["men", "outerwear", "coat", "palto", "wool", "editorial", "luxury", "tashkent"]
  },
  {
    id: "men-outer-015",
    title: "Bomber Jacket — Modern Underground Metro Aesthetic",
    category: "Men",
    subcategory: "Outerwear",
    productType: "Bomber Jacket",
    description: "Contemporary urban campaign shot inside a sleek modern architectural transit space.",
    useCase: "Best for youth streetwear brands and Instagram Reels cover art.",
    prompt: `Inspect the uploaded bomber jacket. Keep its exact ribbed collar, ribbed cuffs and waistband, sleeve utility pocket (if present), zipper style, and fabric sheen.

Scene: Inside a clean, ultra-modern Tashkent metro station lobby with polished granite floors and sleek linear LED ceiling lights.
Model: Young male model standing confident, jacket half-zipped, looking directly into the camera lens.
Styling: The uploaded bomber jacket over a white tee, paired with relaxed black pants.
Lighting: Cool, futuristic linear architectural lighting complemented by a soft beauty dish on the model.
Camera: 35mm f/1.8 prime lens, sharp edge-to-edge clarity, vibrant urban contrast.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "outerwear", "bomber", "streetwear", "urban", "modern"]
  },
  {
    id: "men-casual-016",
    title: "Heavyweight Hoodie — Tashkent Rooftop Sunset",
    category: "Men",
    subcategory: "Casual & Streetwear",
    productType: "Hoodie",
    description: "Atmospheric sunset lifestyle shot highlighting the hood shape, kangaroo pocket, and fleece density.",
    useCase: "Best for streetwear brand campaigns and youth apparel ecommerce stores.",
    prompt: `Strictly analyze the uploaded hoodie. Lock in the exact hood structure (double-layered, cross-neck, or eyelets), drawstrings (or absence of drawstrings), kangaroo pocket shape, ribbing, and exact fleece color.

Scene: Modern high-rise rooftop in Tashkent during sunset, with golden horizon light reflecting off modern city skyscrapers in the background.
Model: Young man standing leaning against the rooftop glass railing, hood resting naturally around his shoulders, relaxed posture.
Styling: The uploaded hoodie paired with relaxed sweatpants in a matching or complementary tone.
Lighting: Warm golden-hour sunset backlighting creating a soft luminous halo along the hoodie's shoulders, with neutral front fill light to preserve the hoodie's true color.
Camera: Canon 85mm f/1.4, rich cinematic warm tones, commercial lookbook quality.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "hoodie", "streetwear", "rooftop", "sunset", "tashkent", "casual"]
  },
  {
    id: "men-casual-017",
    title: "Complete Tracksuit Set — Contemporary Sports Complex",
    category: "Men",
    subcategory: "Casual & Streetwear",
    productType: "Tracksuit Set",
    description: "Full two-piece tracksuit presentation in a clean, modern athletic lifestyle environment.",
    useCase: "Best for loungewear and tracksuit sellers on Uzum and Telegram.",
    prompt: `Examine the uploaded tracksuit set (top and bottoms). Ensure both garments match the exact zipper styling, side stripes, cuff ribbing, drawstrings, pockets, and cotton-fleece texture from the photo.

Scene: Outside a modern sports arena in Tashkent (like Humo Arena exterior plaza) with clean white curved architectural panels.
Model: Athletic male model walking naturally toward the camera with casual confidence.
Styling: The uploaded full tracksuit set worn complete, paired with pristine white athletic sneakers.
Lighting: Crisp morning daylight with clean white sky reflections, showing realistic folds and draping of the fabric.
Camera: 50mm f/2.8 lens, full-body portrait framing, commercial ecommerce realism.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "tracksuit", "casual", "streetwear", "humo-arena", "full-set"]
  },
  {
    id: "men-formal-018",
    title: "Tailored Business Suit — Luxury Conference Hall",
    category: "Men",
    subcategory: "Formal",
    productType: "Two-Piece Classic Suit",
    description: "Flawless corporate campaign displaying the full two-piece suit with impeccable structure.",
    useCase: "Best for formal wear shops, wedding season promotions, and executive menswear.",
    prompt: `Analyze the uploaded suit jacket and trousers. Lock the lapel roll, button count (2-button or 3-button), ticket pocket, breast pocket, fabric weave (worsted wool, subtle pinstripe, or bird’s eye), shoulder padding, and trouser taper.

Scene: Inside an upscale modern conference center in Tashkent with warm wood slat paneling and ambient architectural downlights.
Model: Polished Central Asian businessman standing tall, one hand fastening the top suit button.
Styling: The uploaded suit worn over a crisp white dress shirt with a subtle silk tie and leather dress shoes.
Lighting: Balanced commercial lighting setup that highlights the lapel construction, shoulder line, and precise trouser crease.
Camera: 85mm f/2.8 portrait lens, tack-sharp focus on the wool fabric grain, premium catalog grade.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "formal", "suit", "business", "tailored", "luxury", "conference"]
  },
  {
    id: "men-formal-019",
    title: "Smart Casual Blazer — University Campus Garden",
    category: "Men",
    subcategory: "Formal",
    productType: "Casual Blazer",
    description: "Modern young professional / smart student aesthetic in a bright, green campus setting.",
    useCase: "Best for university students, autumn collections, and smart-casual menswear shops.",
    prompt: `Examine the uploaded casual blazer. Retain the exact patch pockets, button type (horn or metal), elbow patches (if present), fabric blend (tweed, linen, or cotton), and lapel notch.

Scene: Modern university courtyard in Tashkent (e.g., Westminster or Inha University garden) with manicured green lawns and modern glass buildings.
Model: Smart young man in his early 20s standing holding a leather notebook, smiling naturally.
Styling: The uploaded blazer worn open over a crewneck merino sweater, paired with clean dark chinos.
Lighting: Soft morning sunlight filtered through green leaves, offering fresh, vibrant, natural colors.
Camera: 70mm f/2.0 portrait prime, organic colors, crisp depth of field.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["men", "blazer", "smart-casual", "university", "campus", "young-professional"]
  },

  // =========================================================================
  // 2. WOMEN'S CLOTHING
  // =========================================================================
  {
    id: "women-dress-020",
    title: "Summer Floral Sundress — Sunlit Botanical Garden",
    category: "Women",
    subcategory: "Dresses",
    productType: "Summer Dress",
    description: "Vibrant, airy outdoor summer lifestyle shot capturing the movement and pattern of the dress.",
    useCase: "Best for summer dress collections on Instagram and Telegram fashion boutiques.",
    prompt: `Analyze the uploaded dress photo with extreme precision. The exact floral/geometric print, color palette, neckline (sweetheart, V-neck, or square), waist cinch, tiered ruffles, and lightweight fabric drape must remain 100% true to the uploaded source. Do not alter or redraw the print.

Scene: Sunlit pathway in Tashkent Botanical Garden surrounded by blooming summer flowers and lush green foliage.
Model: Elegant Central Asian female model turning gently mid-walk so the skirt of the dress flares naturally with movement.
Styling: The uploaded summer dress styled minimally with a woven straw tote bag and delicate flat sandals.
Lighting: Golden afternoon sunlight with delicate rim lighting highlighting the airy, translucent texture of the dress hem.
Camera: Canon 85mm f/1.4, creamy bokeh background, high-end commercial fashion advertisement look.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["women", "dress", "summer", "floral", "botanical-garden", "lifestyle", "instagram"]
  },
  {
    id: "women-dress-021",
    title: "Elegant Evening Dress — Luxury Banquet Hall",
    category: "Women",
    subcategory: "Dresses",
    productType: "Evening / Party Dress",
    description: "Glamorous, high-end evening look showcasing satin, sequins, or velvet textures.",
    useCase: "Best for wedding guest attire, New Year party wear, and luxury evening wear collections.",
    prompt: `Thoroughly inspect the uploaded evening dress. Lock all sequin patterns, beadwork, slit placement, draping, corset boning, fabric luster (satin, velvet, or chiffon), and exact color shade.

Scene: The grand foyer of an upscale Tashkent luxury hotel or banquet ballroom, with polished marble floors, a sweeping curved staircase, and a crystal chandelier in the soft-focus background.
Model: Graceful woman standing poised on the marble floor, looking confidently at the camera.
Styling: The uploaded evening dress paired with minimalist crystal earrings and sleek stiletto heels.
Lighting: Elegant, soft-focused ballroom ambient light with a specialized front beauty light to make the dress fabric and embellishments shimmer naturally.
Camera: 85mm f/1.8 lens, exquisite high-fashion glamour rendering, tack-sharp garment details.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Intermediate",
    tags: ["women", "dress", "evening", "party", "luxury", "wedding-guest", "glamour"]
  },
  {
    id: "women-modest-022",
    title: "Modern Modest Abaya / Maxi Dress — Minimalist Architecture",
    category: "Women",
    subcategory: "Modest Fashion",
    productType: "Abaya / Modest Long Dress",
    description: "Sophisticated, modern modest fashion look set against sleek contemporary architectural stone.",
    useCase: "Best for modest wear brands, Ramadan/Eid collections, and stylish hijab-friendly shops.",
    prompt: `Analyze the uploaded modest garment image. Preserve the exact abaya cut, loose silhouette, sleeve embroidery, wrist cuffs, button/snap closures, fabric flow, and true color tone.

Scene: Exterior of a modern contemporary architectural building in Tashkent with clean light travertine stone walls and gentle minimalist shadows.
Model: Graceful modern Muslim woman wearing a neatly styled matching silk hijab that coordinates tastefully with the uploaded garment, standing in an elegant side-profile pose.
Styling: The uploaded abaya/long dress worn with a tasteful structured handbag and low block heels.
Lighting: Clean, soft morning sunlight casting gentle architectural shadows, emphasizing the graceful drape and premium flow of the fabric.
Camera: 90mm portrait lens, f/2.8, dignified, premium modest fashion magazine aesthetic.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["women", "modest", "abaya", "hijab-friendly", "long-dress", "modern", "eid"]
  },
  {
    id: "women-modest-023",
    title: "Modest Business Suit / Longline Blazer — Office Lobby",
    category: "Women",
    subcategory: "Modest Fashion",
    productType: "Modest Suit / Longline Blazer",
    description: "Empowered, professional modest corporate look for modern working women.",
    useCase: "Best for business-casual women's collections and Telegram boutique catalogs.",
    prompt: `Carefully examine the uploaded outfit. Preserve the longline blazer silhouette, lapel structure, matching wide-leg trousers, button finishes, and exact fabric color.

Scene: Sunlit glass atrium of a modern corporate business center in Tashkent with indoor green planters.
Model: Confident professional woman wearing a tasteful neutral hijab, holding a leather tablet folio under one arm.
Styling: The uploaded modest suit worn over a high-neck silk top, paired with pointed-toe professional flats.
Lighting: Bright, natural ambient skylight creating even, crisp illumination across the suit fabric.
Camera: 50mm f/2.0 lens, sharp focus on lapel seams and fabric texture, clean commercial finish.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["women", "modest", "business", "blazer", "office", "hijab-friendly", "suit"]
  },
  {
    id: "women-top-024",
    title: "Silk Blouse — Sun-Drenched Modern Living Room",
    category: "Women",
    subcategory: "Tops",
    productType: "Silk Blouse",
    description: "Luxe lifestyle photo showing the soft sheen and feminine drape of a silk blouse.",
    useCase: "Best for premium women's tops and spring/autumn lookbooks.",
    prompt: `Examine the uploaded blouse carefully. Retain the exact collar type (tie-neck bow, mandarin collar, or standard), button details, puff sleeve gathers, silk-satin luster, and original color.

Scene: Bright, minimalist modern apartment living room in Tashkent with Scandinavian furniture, sheer white curtains, and a fiddle-leaf fig plant.
Model: Young woman sitting comfortably on a contemporary cream boucle sofa, coffee cup in hand.
Styling: The uploaded silk blouse tucked cleanly into high-waisted tailored beige trousers.
Lighting: Warm, diffused natural light filtering through sheer curtains, bringing out the soft specular sheen of the silk fabric.
Camera: Sony A7R IV, 50mm f/1.8, soft organic depth, premium editorial lifestyle tone.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["women", "tops", "blouse", "silk", "lifestyle", "apartment", "elegant"]
  },
  {
    id: "women-top-025",
    title: "Oversized Knit Cardigan — Cozy Winter Café",
    category: "Women",
    subcategory: "Tops",
    productType: "Knit Cardigan",
    description: "Warm, inviting lifestyle visual showcasing the knit gauge, buttons, and cozy feel.",
    useCase: "Best for autumn and winter knitwear promotion on Instagram feed and Telegram.",
    prompt: `Analyze the uploaded knit cardigan. Preserve the exact chunky cable-knit or ribbed pattern, horn/tortoise buttons, drop-shoulder cut, pockets, and exact yarn color.

Scene: Inside a cozy Tashkent artisanal coffee shop with warm wooden interiors and rain or snow softly blurring the windowpane.
Model: Cozy woman seated by the window, hands gently wrapped around a ceramic mug, smiling.
Styling: The uploaded cardigan worn open over a simple white ribbed tank top, paired with mom-fit blue jeans.
Lighting: Warm interior amber pendant lights mixed with soft cool daylight from the window, highlighting the depth of the knit yarn.
Camera: 85mm f/1.4, shallow depth of field, warm cozy aesthetic.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["women", "tops", "cardigan", "knitwear", "cozy", "cafe", "winter"]
  },
  {
    id: "women-bottom-026",
    title: "High-Waisted Wide-Leg Trousers — City Walk",
    category: "Women",
    subcategory: "Bottoms",
    productType: "Wide-Leg Trousers",
    description: "Fashion-forward street style shot highlighting the waistline, pleats, and flowing drape.",
    useCase: "Best for viral Instagram Reels and fashion-forward boutique posts.",
    prompt: `Analyze the uploaded trousers photo. Preserve the high-rise waistband, belt loops, front pleats, wide-leg flare, hem length, and exact fabric color and weight.

Scene: Modern pedestrian boulevard in Tashkent with contemporary designer shopfronts in the background.
Model: Chic woman captured mid-stride, showcasing how the wide-leg fabric moves with fluid elegance.
Styling: The uploaded trousers paired with a fitted cropped ribbed top and a mini leather shoulder bag.
Framing: Three-quarter vertical portrait framed from mid-chest down to pointed-toe heels.
Lighting: Bright sunny afternoon daylight with crisp ground shadows, highlighting the crisp center crease and waistband.
Camera: 50mm f/1.8 lens, high-speed shutter to freeze the fluid movement of the trousers perfectly.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["women", "bottoms", "trousers", "wide-leg", "streetstyle", "fashion", "tashkent"]
  },
  {
    id: "women-outer-027",
    title: "Classic Trench Coat — Autumn Rain Walk",
    category: "Women",
    subcategory: "Outerwear",
    productType: "Trench Coat",
    description: "Timeless Parisian-chic autumn shot in an urban setting.",
    useCase: "Best for autumn outerwear collections and Telegram channel featured banners.",
    prompt: `Inspect the uploaded trench coat carefully. Maintain the exact storm flap, double-breasted buttons, waist belt and buckle, wrist straps, epaulets, and water-repellent gabardine texture.

Scene: Autumn street in Tashkent with golden fallen leaves on the clean sidewalk, wet reflections on the ground, holding a transparent umbrella.
Model: Stylish woman walking toward the camera, trench coat belted neatly at the waist to accentuate the silhouette.
Styling: The uploaded trench coat styled with ankle leather boots and a minimalist leather crossbody bag.
Lighting: Soft, overcast autumn daylight, rich color saturation on the golden leaves and realistic reflections on wet pavement.
Camera: 85mm f/2.0, crisp sharpness on the coat fabric, buttons, and belt buckle.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["women", "outerwear", "trench-coat", "autumn", "classic", "chic"]
  },
  {
    id: "women-outer-028",
    title: "Cropped Leather Jacket — Urban Neon Night",
    category: "Women",
    subcategory: "Outerwear",
    productType: "Cropped Leather Jacket",
    description: "Edgy, high-energy night fashion shot for modern women's streetwear.",
    useCase: "Best for youth fashion drops, TikTok ads, and Instagram Story covers (9:16).",
    prompt: `Examine the uploaded cropped leather jacket. Preserve its cropped length, metallic hardware, lapel styling, pocket zippers, leather grain, and true color tone.

Scene: Tashkent city nightlife district with glowing neon storefront signs, modern glass storefronts, and deep night reflections.
Model: Edgy young woman standing with confident attitude, one hand on her hip.
Styling: The uploaded leather jacket worn over a simple black top, paired with high-waisted distressed denim.
Composition: 9:16 vertical full-length social media ad format with negative space at top.
Lighting: Vibrant dual-tone neon ambient rim lighting balanced with a crisp, neutral beauty flash on the face and jacket.
Camera: 35mm f/1.4, punchy colors, ultra-realistic commercial fashion grade.
Orientation: 9:16`,
    aspectRatio: "9:16",
    difficulty: "Intermediate",
    tags: ["women", "outerwear", "leather-jacket", "cropped", "night", "neon", "reels"]
  },
  {
    id: "women-outer-029",
    title: "Bouclé Tweed Jacket — French Chic Boutique Look",
    category: "Women",
    subcategory: "Outerwear",
    productType: "Bouclé Tweed Jacket",
    description: "High-end luxury aesthetic capturing textured bouclé weave and ornate pearl/gold buttons.",
    useCase: "Best for premium women's boutiques and luxury fashion catalogs.",
    prompt: `Analyze the uploaded bouclé/tweed jacket. Preserve the exact textured yarn weave, metallic/pearl button designs, pocket trims, fringe edges (if any), collarless neckline, and authentic color blend.

Scene: Exterior terrace of a luxury French-inspired patisserie in Tashkent with wrought-iron chairs and polished marble tabletops.
Model: Refined woman sitting gracefully, legs crossed, holding a delicate porcelain tea saucer.
Styling: The uploaded tweed jacket paired with tailored straight-leg cream trousers and classic cap-toe slingback heels.
Lighting: Soft morning sunlight, bringing out the intricate three-dimensional texture of the bouclé fabric.
Camera: Hasselblad 80mm lens, f/3.2, ultra-luxury commercial clarity.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["women", "outerwear", "jacket", "tweed", "boucle", "luxury", "boutique"]
  },

  // =========================================================================
  // 3. CHILDREN'S CLOTHING
  // =========================================================================
  {
    id: "kids-boy-030",
    title: "Boys Graphic T-Shirt & Shorts — Bright Playground Lifestyle",
    category: "Kids & Baby",
    subcategory: "Boys",
    productType: "Boys Summer Set",
    description: "Cheerful, safe, and dynamic outdoor photo of a young boy wearing casual playwear.",
    useCase: "Best for children's clothing stores, summer sales, and Telegram family shopping channels.",
    prompt: `Analyze the uploaded boy's clothing set (T-shirt and shorts). Preserve the exact cartoon/graphic print, neckline ribbing, waistband drawstring, fabric colors, and cotton texture without introducing any fake logos or alterations.

Scene: A modern, safe, colorful children's outdoor playground in a Tashkent residential park on a sunny day.
Model: A happy 6-year-old Central Asian boy running joyfully across the soft rubber turf, smiling naturally.
Styling: The uploaded boy's outfit worn naturally, paired with clean velcro kid sneakers.
Lighting: Bright, joyful natural sunlight with soft fill shadows, conveying fun, safety, and vibrant play.
Camera: Fast shutter speed (1/1000s), 70mm f/2.8, tack-sharp on the child and clothing with a pleasantly soft background. Safe, commercial, family-friendly advertising standards.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["kids", "boys", "t-shirt", "shorts", "playground", "summer", "family"]
  },
  {
    id: "kids-boy-031",
    title: "Boys Winter Puffer & Beanie — Winter Fun",
    category: "Kids & Baby",
    subcategory: "Boys",
    productType: "Boys Puffer Jacket",
    description: "Wholesome winter lifestyle shot of a boy in warm outerwear in a snowy park.",
    useCase: "Best for seasonal winter children's apparel campaigns.",
    prompt: `Inspect the uploaded boy's winter jacket carefully. Maintain the exact baffle width, zipper color, hood trim, fleece lining, and true color tone.

Scene: Tashkent city park after fresh snowfall, clean white snow on trees.
Model: A cheerful 8-year-old boy building a mini snowman, wearing the uploaded jacket securely zipped up.
Styling: The uploaded jacket styled with warm kid's snow boots and cozy mittens.
Lighting: Bright, diffused winter daylight, capturing the waterproof sheen and loft of the jacket.
Camera: 85mm f/2.2, wholesome, commercial family brand advertising aesthetic.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["kids", "boys", "outerwear", "puffer", "winter", "snow", "warm"]
  },
  {
    id: "kids-girl-032",
    title: "Girls Pastel Party Dress — Birthday Celebration Setup",
    category: "Kids & Baby",
    subcategory: "Girls",
    productType: "Girls Party Dress",
    description: "Festive, sweet party atmosphere showcasing tulle, ruffles, and bows.",
    useCase: "Best for holiday dresses, birthday outfit collections, and kids' boutique lookbooks.",
    prompt: `Analyze the uploaded girl's dress. Preserve the exact tulle layers, lace trims, bow accents, sequin detailing, sleeve shape, and pastel color shades identically.

Scene: Tastefully decorated children's birthday party room with pastel balloon arches, fairy lights, and light wooden floors.
Model: A sweet 5-year-old girl twirling happily, holding the edges of her dress skirt.
Styling: The uploaded dress paired with clean white Mary Jane shoes and a subtle matching hair ribbon.
Lighting: Warm, magical interior lighting with soft fairy light bokeh balls in the background.
Camera: 50mm f/1.8, vibrant, joyful, high-resolution commercial children's catalog photography.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["kids", "girls", "dress", "party", "birthday", "tulle", "pastel"]
  },
  {
    id: "kids-girl-033",
    title: "Girls Denim Pinafore / Overalls — Creative Art Room",
    category: "Kids & Baby",
    subcategory: "Girls",
    productType: "Girls Denim Pinafore",
    description: "Charming casual lifestyle shot of a young girl engaged in painting and crafts.",
    useCase: "Best for casual children's wear and everyday back-to-kindergarten collections.",
    prompt: `Examine the uploaded girl's denim overalls/pinafore. Keep all buckle closures, front patch pockets, contrast stitching, denim wash, and cut accurate to the original image.

Scene: A bright, sunlit children's art studio room with wooden easels and colorful watercolor art on the walls.
Model: A cute 7-year-old girl holding a paintbrush with a cheerful expression, standing near a craft table.
Styling: The uploaded denim pinafore worn over a yellow striped long-sleeve cotton tee.
Lighting: Soft, natural daylight from large studio windows, highlighting the durable denim texture.
Camera: 50mm f/2.0, natural, warm, wholesome commercial photography.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["kids", "girls", "denim", "overalls", "creative", "casual", "wholesome"]
  },
  {
    id: "baby-034",
    title: "Baby Ribbed Cotton Romper — Neutral Nursery Flat Lay",
    category: "Kids & Baby",
    subcategory: "Baby",
    productType: "Baby Romper / Bodysuit",
    description: "Ultra-clean, aesthetically pleasing newborn flat lay with organic wooden baby props.",
    useCase: "Best for newborn boutiques, maternity shops, and baby gift collections on Instagram.",
    prompt: `Analyze the uploaded baby romper photo. Maintain the exact ribbed organic cotton texture, wooden buttons down the chest, snap crotch closure, cuff folds, and natural earthy color swatch.

Scene: 90-degree flat lay arranged on a soft, natural cream waffle-knit baby blanket.
Composition: The uploaded romper laid out neatly in the center, accented with a natural wooden teether rattle, mini knit booties, and a small sprig of dried eucalyptus.
Lighting: Soft, directional morning window light coming from the top-left, casting delicate, feather-soft shadows.
Camera: 50mm macro prime, f/4, perfectly flat overhead plane, ultra-clean aesthetic baby boutique presentation.
Orientation: 1:1 square.`,
    aspectRatio: "1:1",
    difficulty: "Beginner",
    tags: ["kids", "baby", "newborn", "romper", "flatlay", "nursery", "organic", "minimal"]
  },
  {
    id: "baby-035",
    title: "Baby Sleepsuit Set — Cozy Sunlit Nursery Crib",
    category: "Kids & Baby",
    subcategory: "Baby",
    productType: "Baby Pajamas / Sleepsuit",
    description: "Heartwarming lifestyle image of a baby sleepsuit presented in a modern Scandinavian nursery.",
    useCase: "Best for baby sleepwear and newborn apparel ecommerce catalogs.",
    prompt: `Examine the uploaded baby sleepsuit. Lock the exact front zipper/snaps, footie grips, mitten cuffs, printed pattern (or solid color), and soft cotton jersey fabric structure.

Scene: A modern, minimalist nursery with a natural light-wood crib, soft linen bumper, and neutral wallpaper.
Composition: Clean presentation of the baby sleepsuit resting on the crib mattress, staged with a plush organic teddy bear beside it.
Lighting: Warm, gentle morning sunlight streaming into the nursery, creating a safe, soothing, pure atmosphere.
Camera: 50mm f/2.2, soft focus background, pristine commercial baby brand imagery.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["kids", "baby", "sleepsuit", "pajamas", "nursery", "crib", "cozy"]
  },

  // =========================================================================
  // 4. SCHOOL CLOTHING & UNIFORMS
  // =========================================================================
  {
    id: "school-036",
    title: "Boys Classic White School Shirt & Trousers — Modern Classroom",
    category: "Schoolwear",
    subcategory: "Uniforms",
    productType: "Boys School Uniform Set",
    description: "Classic back-to-school portrait of a student wearing a crisp white shirt and navy/black trousers.",
    useCase: "Best for August back-to-school sales campaigns on Telegram channels and Uzum marketplace.",
    prompt: `Carefully examine the uploaded school uniform items (white shirt and dark trousers). Maintain the crisp point collar, button placket, breast pocket, trouser crease, dark navy/black shade, and smooth cotton-poly blend. Do not add fictitious badges or school crests.

Scene: A clean, bright, modern school classroom in Tashkent with wooden student desks and a clean chalkboard/whiteboard in the soft-focus background.
Model: A polite, well-dressed 10-year-old Central Asian schoolboy standing beside a classroom desk, smiling neatly with a school backpack resting on the chair.
Styling: The uploaded school shirt tucked neatly into the trousers, worn with a dark belt and black polished school shoes.
Lighting: Crisp, bright daylight flooding from large classroom windows, accentuating the clean, wrinkle-free white shirt.
Camera: 50mm f/2.5 portrait lens, sharp, professional back-to-school commercial photography.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["schoolwear", "uniform", "shirt", "trousers", "classroom", "back-to-school", "tashkent"]
  },
  {
    id: "school-037",
    title: "Girls School Uniform Dress / Pinafore — School Hallway",
    category: "Schoolwear",
    subcategory: "Uniforms",
    productType: "Girls School Dress / Pinafore",
    description: "Neat, modest school dress for girls in a modern school corridor environment.",
    useCase: "Best for back-to-school uniform promotions in Uzbekistan.",
    prompt: `Analyze the uploaded girl's school dress/pinafore. Lock in the exact pleats, collar trim (white lace or contrast collar), button fasteners, waist belt, and dark navy/black/dark brown fabric color.

Scene: A wide, sunlit modern school hallway with lockers and clean tiled floors during morning hours.
Model: A neat 12-year-old schoolgirl standing holding school textbooks in her arms, smiling warmly.
Styling: The uploaded school uniform dress worn with knee-high white socks and black patent school flats.
Lighting: Bright, clean morning hallway lighting with soft fill, creating an uplifting, academic atmosphere.
Camera: 85mm f/2.0, beautiful background separation, ultra-realistic commercial catalog quality.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["schoolwear", "uniform", "dress", "pinafore", "hallway", "back-to-school", "girls"]
  },
  {
    id: "school-038",
    title: "School Knit Vest / Cardigan — Back-to-School Flat Lay",
    category: "Schoolwear",
    subcategory: "Knitwear",
    productType: "School Knit Vest",
    description: "Structured back-to-school product flat lay with textbooks, stationery, and a backpack.",
    useCase: "Best for August marketing announcements, carousel post hero images, and banner ads.",
    prompt: `Examine the uploaded school knit vest. Maintain the exact V-neck ribbing, cable or plain knit pattern, armhole ribbing, deep navy/burgundy/black color, and knit density.

Scene: Overhead 90-degree flat lay on a clean light oak wooden study desk.
Composition: The uploaded knit vest placed neatly over a folded white school shirt in the center, flanked by a classic leather-trimmed school backpack, a hardbound notebook, a pencil case, and brass geometry tools.
Lighting: Crisp overhead daylight casting gentle, clean shadows under the stationery and knit folds.
Details: Razor-sharp fabric definition, visible knit stitches, perfectly organized commercial arrangement.
Orientation: 1:1 square.`,
    aspectRatio: "1:1",
    difficulty: "Beginner",
    tags: ["schoolwear", "vest", "knitwear", "flatlay", "stationery", "back-to-school", "square"]
  },
  {
    id: "school-039",
    title: "Kids PE Sports Uniform — School Gymnasium",
    category: "Schoolwear",
    subcategory: "PE & Sports",
    productType: "School Tracksuit / PE Kit",
    description: "Active school sports kit presentation inside a clean school gym.",
    useCase: "Best for physical education apparel, youth tracksuits, and school sport kit sellers.",
    prompt: `Analyze the uploaded physical education (PE) kit/tracksuit. Preserve the exact side piping, zipper collar, elastic waistband, breathable poly-cotton fabric texture, and authentic colors.

Scene: Modern, clean indoor school gymnasium with polished hardwood basketball court flooring and bright high-bay sports lights.
Model: Energetic 11-year-old student holding a basketball under one arm, standing on the court center circle.
Styling: The uploaded PE tracksuit worn with clean indoor athletic sneakers.
Lighting: Bright, evenly distributed gymnasium stadium lighting, capturing the vibrant colors and athletic cut of the uniform.
Camera: 50mm f/2.8, action-ready commercial photography, ultra-crisp detail.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["schoolwear", "pe-kit", "tracksuit", "gymnasium", "sports", "back-to-school"]
  },

  // =========================================================================
  // 5. SPORTSWEAR & ATHLETICS
  // =========================================================================
  {
    id: "sports-foot-040",
    title: "Football Jersey — Stadium Under Floodlights",
    category: "Sportswear",
    subcategory: "Football",
    productType: "Football Jersey",
    description: "Epic, dramatic sports campaign of a football jersey under blazing stadium floodlights.",
    useCase: "Best for football club kits, fan jerseys, and sports store social media hero posts.",
    prompt: `Examine the uploaded football jersey meticulously. The collar construction (V-neck, crew, or polo collar), sleeve stripes, breathable mesh side panels, crest placement, chest sponsor typography, and exact team colors must be preserved with 100% fidelity. Do not invent new logos or distort existing team badges.

Scene: Inside a major modern football stadium (like Bunyodkor or Pakhtakor Stadium in Tashkent) at night, with pristine manicured green grass and powerful floodlights glowing in the background.
Model: Athletic male football player standing on the pitch, hands on hips, looking determined.
Styling: The uploaded football jersey worn fitted, paired with matching football shorts and high soccer socks.
Lighting: Dramatic sports stadium lighting — high-intensity rim backlights illuminating rain mist and the player's shoulders, with crisp front fill to showcase the jersey crest and fabric breathability.
Camera: 70-200mm f/2.8 at 135mm, sports advertising commercial masterpiece, dynamic stadium depth.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Intermediate",
    tags: ["sportswear", "football", "jersey", "stadium", "matchday"]
  },
  {
    id: "sports-bball-041",
    title: "Basketball Sleeveless Jersey — Concrete Streetball Court",
    category: "Sportswear",
    subcategory: "Basketball",
    productType: "Basketball Jersey",
    description: "High-octane urban streetball aesthetic highlighting mesh texture, armhole trim, and numbering.",
    useCase: "Best for basketball apparel, summer sports drops, and TikTok streetwear.",
    prompt: `Analyze the uploaded basketball jersey. Preserve the wide rib-knit armholes, V-neck or round collar, mesh eyelets, front typography/numbering, and color blocking exactly as pictured.

Scene: Vibrant urban outdoor basketball court with chain-link fencing and painted asphalt lines under clear skies.
Model: Athletic player holding a basketball on his hip in a dynamic ready stance.
Styling: The uploaded basketball jersey worn over a compression undershirt with basketball shorts and high-top sneakers.
Lighting: Hard directional sunlight creating strong athletic muscle definition and crisp jersey mesh highlights.
Camera: 35mm wide-angle lens, low dynamic angle, high energy sports portrait.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["sportswear", "basketball", "jersey", "streetball", "urban", "summer"]
  },
  {
    id: "sports-run-042",
    title: "Running Windbreaker & Tights — City Park Morning Run",
    category: "Sportswear",
    subcategory: "Running",
    productType: "Running Windbreaker",
    description: "Dynamic early morning running lifestyle shot demonstrating lightweight weather resistance and reflectivity.",
    useCase: "Best for marathon runners, fitness gear sellers, and morning workout campaigns.",
    prompt: `Inspect the uploaded running windbreaker. Preserve the reflective stripe accents, thumbhole cuffs, half-zip or full-zip front, hood contour, and ultralight ripstop nylon texture.

Scene: Tashkent National Park running track at sunrise, with soft morning mist and green trees.
Model: Male or female runner captured mid-stride with fluid athletic movement.
Styling: The uploaded windbreaker paired with compression running tights and performance running shoes.
Lighting: Warm golden sunrise backlighting highlighting the thin, breathable jacket silhouette with crisp morning clarity.
Camera: Fast shutter speed (1/2000s), 85mm f/2.0, crystal sharp focus on the runner and jacket.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["sportswear", "running", "windbreaker", "morning", "park", "fitness"]
  },
  {
    id: "sports-gym-043",
    title: "Gym Compression Shirt — Premium Fitness Club",
    category: "Sportswear",
    subcategory: "Gym & Fitness",
    productType: "Compression Workout Top",
    description: "Sculpted, high-contrast gym atmosphere highlighting athletic fit, flatlock seams, and moisture-wicking fabric.",
    useCase: "Best for bodybuilding, CrossFit, and workout wear marketing on Instagram.",
    prompt: `Carefully examine the uploaded compression shirt. Lock in the raglan sleeve seams, flatlock stitching, chest branding, crewneck, and matte elastane-blend stretch finish.

Scene: High-end, dimly lit modern gym with matte black dumbbells, steel racks, and linear ambient LED mood lighting.
Model: Muscular athlete resting between sets, chalk on hands, looking focused.
Styling: The uploaded compression top worn tight to the physique, paired with training shorts over compression liners.
Lighting: Dramatic rim lighting and focused overhead spotlights to accentuate muscular contour and flatlock seam construction.
Camera: 50mm f/1.8, high contrast, deep cinematic blacks, commercial athletic grade.
Orientation: 4:5 vertical.`,
    aspectRatio: "4:5",
    difficulty: "Intermediate",
    tags: ["sportswear", "gym", "compression", "fitness", "bodybuilding", "workout"]
  },
  {
    id: "sports-tennis-044",
    title: "Tennis Polo & Pleated Skirt — Sunlit Clay Court",
    category: "Sportswear",
    subcategory: "Tennis",
    productType: "Tennis Set",
    description: "Crisp, country-club aesthetic on a pristine tennis court.",
    useCase: "Best for tennis wear, padel collections, and preppy athletic fashion.",
    prompt: "Analyze the uploaded tennis outfit. Retain the exact collar piping, button placket, pleat depth on the skirt/shorts, breathable pique texture, and crisp athletic color swatch.\n\nScene: Premium outdoor tennis clay court with green windscreen netting and crisp white boundary lines.\nModel: Female tennis player resting a racket over her shoulder with a relaxed, confident smile.\nStyling: The uploaded tennis set styled with a tennis visor cap, white wristbands, and tennis shoes.\nLighting: Bright, clean mid-morning sunlight creating pure whites and crisp, vibrant tennis club tones.\nCamera: 85mm f/2.2, crisp, clean, high-society sports editorial.\nOrientation: 4:5 vertical.",
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["sportswear", "tennis", "polo", "skirt", "clay-court", "preppy", "padel"]
  },
  {
    id: "sports-box-045",
    title: "Boxing / MMA Training Hoodie & Shorts — Combat Gym",
    category: "Sportswear",
    subcategory: "Boxing & Martial Arts",
    productType: "Combat Sportswear",
    description: "Gritty, powerful combat sports aesthetic in a traditional boxing gym.",
    useCase: "Best for boxing, MMA, and fightwear brands on social media.",
    prompt: "Examine the uploaded fightwear / training hoodie and shorts. Preserve the wide elastic waistband, side slits, heavyweight fleece or satin finish, drawstrings, and any emblem prints identically.\n\nScene: Authentic combat gym with heavy leather punching bags hanging in the background and a boxing ring canvas.\nModel: Focused fighter with wrapped hands standing confident, hood pulled up over head.\nStyling: The uploaded fightwear worn with boxing boots or bare feet on training mats.\nLighting: Moody low-key cinematic lighting with directional key light sculpting intense facial focus and garment fabric.\nCamera: 50mm f/1.8 prime lens, high contrast, gritty raw sports realism.\nOrientation: 4:5 vertical.",
    aspectRatio: "4:5",
    difficulty: "Intermediate",
    tags: ["sportswear", "boxing", "mma", "martial-arts", "gym", "hoodie", "combat"]
  },

  // =========================================================================
  // 6. SEASONAL & CAMPAIGNS
  // =========================================================================
  {
    id: "season-eid-046",
    title: "Navruz / Eid Holiday Festive Look — Historic Samarkand Tile Architecture",
    category: "Seasonal & Campaigns",
    subcategory: "Holiday & Cultural",
    productType: "Festive Traditional-Modern Attire",
    description: "Breathtaking cultural holiday campaign set against iconic Uzbek blue mosaic tiles.",
    useCase: "Best for Navruz, Eid, and Ramadan holiday fashion marketing.",
    prompt: "Strictly analyze the uploaded festive garment. Preserve the exact adras, ikat, or silk embroidery motifs, neckline cut, metallic gold threading, silhouette, and vibrant natural dye colors without distortion.\n\nScene: Sunlit courtyard in front of historic mosaic tile arches in Samarkand or Bukhara with intricate turquoise and lapis lazuli patterns.\nModel: Radiant Central Asian model smiling warmly in a graceful traditional-contemporary holiday pose.\nStyling: The uploaded festive outfit paired with tasteful traditional jewelry and velvet footwear.\nLighting: Golden morning sunlight illuminating the rich textures of the fabric and vibrant turquoise architectural backdrop.\nCamera: Hasselblad 100mm f/2.8, national cultural heritage advertising masterpiece, tack-sharp resolution.\nOrientation: 4:5 vertical.",
    aspectRatio: "4:5",
    difficulty: "Beginner",
    tags: ["seasonal", "eid", "navruz", "samarkand", "ikat", "adras", "holiday", "festive"]
  },
  {
    id: "season-sale-047",
    title: "Black Friday / Season End Sale — High-Impact Studio Hero",
    category: "Seasonal & Campaigns",
    subcategory: "Promotional & Sale",
    productType: "Sale Campaign Clothing Showcase",
    description: "High-converting, bold sale campaign shot designed for high-CTR promotional ads.",
    useCase: "Best for Black Friday, seasonal clearance, and flash sale Instagram ad campaigns.",
    prompt: "Examine the uploaded product image. Keep the garment 100% true to its genuine form, seams, colors, and cuts.\n\nScene: High-impact minimalist studio setup with deep charcoal background and bold directional side lighting.\nModel: Energetic model holding up a sleek shopping bag while wearing the uploaded garment.\nComposition: Clean 9:16 vertical orientation with generous upper space for overlaying 'CHEGIRMA' or 'SALE' discount typography.\nLighting: Crisp fashion strobe lighting that delivers true color accuracy and punchy commercial depth.\nCamera: 50mm f/2.8, razor-sharp product clarity, high CTR digital ad standard.\nOrientation: 9:16",
    aspectRatio: "9:16",
    difficulty: "Beginner",
    tags: ["seasonal", "sale", "black-friday", "discount", "ad", "reels", "story"]
  }
];
