import { extendedCopy } from './marketingExtendedTranslations';
import { additionalLocaleTranslations } from './additionalLocaleTranslations';

export type Continent = 'asia' | 'africa' | 'europe' | 'north-america' | 'south-america' | 'oceania' | 'unknown';
export type MarketingLanguage = 'en' | 'bn' | 'hi' | 'ar' | 'fr' | 'es' | 'pt' | 'zh' | 'de' | 'ja' | 'ko' | 'ru' | 'tr' | 'ta' | 'te' | 'ur' | 'it' | 'nl' | 'th' | 'vi' | 'uk' | 'pl' | 'el' | 'he' | 'ne' | 'si' | 'sv' | 'da';
export type CountryLanguage = { code: string; name: string; languages: { code: string; name: string }[] };

export const languageOptions: Record<Continent, { value: MarketingLanguage; label: string }[]> = {
  asia: [{ value: 'bn', label: 'বাংলা' }, { value: 'hi', label: 'हिन्दी' }, { value: 'en', label: 'English' }],
  africa: [{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }, { value: 'ar', label: 'العربية' }],
  europe: [{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }, { value: 'es', label: 'Español' }],
  'north-america': [{ value: 'en', label: 'English' }, { value: 'es', label: 'Español' }, { value: 'fr', label: 'Français' }],
  'south-america': [{ value: 'es', label: 'Español' }, { value: 'pt', label: 'Português' }, { value: 'en', label: 'English' }],
  oceania: [{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }],
  unknown: [{ value: 'en', label: 'English' }, { value: 'bn', label: 'বাংলা' }]
};

export const defaultLanguage: Record<Continent, MarketingLanguage> = {
  asia: 'en', africa: 'en', europe: 'en', 'north-america': 'en', 'south-america': 'en', oceania: 'en', unknown: 'en'
};

const hero: Partial<Record<MarketingLanguage, string[][]>> = {
  en: [
    ['MecoPay is a complete e-commerce solution—', 'with powerful payment gateways', 'and a no-code website builder.'],
    ['Use your custom website or', 'our no-code website with APIs and links', 'and accept payments through social media payment links.'],
    ['Create a website in a few clicks,', 'add a custom domain,', 'and build your digital identity.'],
    ['Receive automated orders from social media', 'with an AI Agent Chatbot', '(for no-code website users).'],
    ['Add a courier API to our platform,', 'confirm orders in one click,', 'and send them directly to the courier.']
  ],
  bn: [
    ['MecoPay একটি পূর্ণাঙ্গ ই-কমার্স সলিউশন—', 'শক্তিশালী পেমেন্ট গেটওয়ে', 'এবং নো-কোড ওয়েবসাইট বিল্ডারসহ।'],
    ['নিজস্ব Custom Website অথবা', 'আমাদের No-Code ওয়েবসাইটে API ও Link ব্যবহার করে', 'সোশ্যাল মিডিয়া Payment Link দিয়েও পেমেন্ট নিন।'],
    ['কয়েক ক্লিকেই ওয়েবসাইট তৈরি করুন,', 'Custom Domain যোগ করুন,', 'এবং নিজের ডিজিটাল আইডেন্টিটি তৈরি করুন।'],
    ['AI Agent Chatbot-এর মাধ্যমে', 'সোশ্যাল মিডিয়া থেকে স্বয়ংক্রিয় অর্ডার নিন', '(No-Code Website ব্যবহারকারীদের জন্য)।'],
    ['আমাদের প্ল্যাটফর্মে Courier API যোগ করে', 'এক ক্লিকেই অর্ডার কনফার্ম করুন', 'এবং সরাসরি কুরিয়ারে পাঠান।']
  ],
  hi: [
    ['MecoPay एक संपूर्ण ई-कॉमर्स समाधान है—', 'शक्तिशाली भुगतान गेटवे के साथ', 'और बिना कोड वाला वेबसाइट बिल्डर।'],
    ['अपनी Custom Website या', 'हमारी No-Code Website में API और Link का उपयोग करें', 'और सोशल मीडिया Payment Link से भुगतान लें।'],
    ['कुछ ही क्लिक में वेबसाइट बनाएं,', 'Custom Domain जोड़ें', 'और अपनी डिजिटल पहचान बनाएं।'],
    ['AI Agent Chatbot से', 'सोशल मीडिया से ऑटोमेटेड ऑर्डर लें', '(No-Code Website users के लिए)।'],
    ['हमारे प्लेटफॉर्म पर Courier API जोड़ें,', 'एक क्लिक में ऑर्डर कन्फर्म करें', 'और सीधे कूरियर को भेजें।']
  ],
  ar: [
    ['MecoPay هو حل متكامل للتجارة الإلكترونية—', 'مع بوابات دفع قوية', 'ومنشئ مواقع بدون برمجة.'],
    ['استخدم موقعك المخصص أو', 'موقعنا بدون برمجة مع API والروابط', 'واستقبل المدفوعات عبر روابط الدفع في وسائل التواصل.'],
    ['أنشئ موقعاً خلال دقائق،', 'أضف نطاقاً مخصصاً', 'وابنِ هويتك الرقمية.'],
    ['استقبل الطلبات تلقائياً من وسائل التواصل', 'بواسطة روبوت AI Agent', '(لمستخدمي المواقع بدون برمجة).'],
    ['أضف Courier API إلى منصتنا،', 'أكد الطلب بنقرة واحدة', 'وأرسله مباشرة إلى شركة التوصيل.']
  ],
  fr: [
    ['MecoPay est une solution e-commerce complète—', 'avec des passerelles de paiement puissantes', 'et un créateur de site sans code.'],
    ['Utilisez votre site personnalisé ou', 'notre site sans code avec API et liens', 'et recevez des paiements via les réseaux sociaux.'],
    ['Créez un site en quelques clics,', 'ajoutez un domaine personnalisé', 'et construisez votre identité numérique.'],
    ['Recevez automatiquement les commandes des réseaux sociaux', 'avec un chatbot AI Agent', '(pour les utilisateurs sans code).'],
    ['Ajoutez une API de livraison à notre plateforme,', 'confirmez les commandes en un clic', 'et envoyez-les directement au transporteur.']
  ],
  es: [
    ['MecoPay es una solución completa de comercio electrónico—', 'con potentes pasarelas de pago', 'y un creador de sitios sin código.'],
    ['Usa tu sitio personalizado o', 'nuestro sitio sin código con API y enlaces', 'y recibe pagos mediante enlaces en redes sociales.'],
    ['Crea un sitio web en pocos clics,', 'añade un dominio personalizado', 'y construye tu identidad digital.'],
    ['Recibe pedidos automáticos desde redes sociales', 'con un chatbot AI Agent', '(para usuarios de sitios sin código).'],
    ['Añade una API de mensajería a nuestra plataforma,', 'confirma pedidos con un clic', 'y envíalos directamente al transportista.']
  ],
  pt: [
    ['MecoPay é uma solução completa de e-commerce—', 'com gateways de pagamento poderosos', 'e um criador de sites sem código.'],
    ['Use seu site personalizado ou', 'nosso site sem código com APIs e links', 'e receba pagamentos pelas redes sociais.'],
    ['Crie um site em poucos cliques,', 'adicione um domínio personalizado', 'e construa sua identidade digital.'],
    ['Receba pedidos automáticos das redes sociais', 'com um chatbot AI Agent', '(para usuários de sites sem código).'],
    ['Adicione uma API de entregas à plataforma,', 'confirme pedidos com um clique', 'e envie-os diretamente à transportadora.']
  ]
};

const featureCopy: Partial<Record<MarketingLanguage, Record<string, [string, string]>>> = {
  en: {
    'no-code-website': ['Create and publish e-commerce, education, blog, or news sites without coding.', 'Example: publish a landing page and product post from the course seller dashboard.'],
    'custom-domain': ['Connect your own domain and build a professional digital identity with faster routing.', 'Example: your store runs on www.acme.com instead of a platform subdomain.'],
    capi: ['Send conversion events server-side for reliable campaign measurement.', 'Example: a purchase event is sent from the server to the ad platform.'],
    'personal-mfs': ['Automate supported personal MFS payment verification.', 'Example: a personal MFS payment is matched to the website order.'],
    'local-gateway': ['Connect local payment methods for regional customers.', 'Example: a local buyer completes checkout through a regional gateway.'],
    'international-gateway': ['Connect international payment methods for customers worldwide.', 'Example: an overseas buyer completes checkout with a global method.'],
    notifications: ['Send payment and order updates to customers and merchants.', 'Example: payment success triggers a merchant alert and customer update.'],
    courier: ['Send confirmed orders into a supported courier workflow automatically.', 'Example: a confirmed COD order is prepared for courier handoff.'],
    'business-email': ['Send and receive professional email on your own branded domain.', 'Example: sales@acme.com receives inquiries and support@acme.com replies.']
  },
  bn: {
    'no-code-website': ['কোনো কোডিং ছাড়াই ই-কমার্স, এডটেক, ব্লগ বা নিউজ সাইট তৈরি ও publish করুন।', 'উদাহরণ: seller dashboard থেকে landing page ও product post publish করুন।'],
    'custom-domain': ['নিজস্ব domain connect করে professional digital identity তৈরি করুন।', 'উদাহরণ: platform subdomain-এর বদলে আপনার store www.acme.com-এ চলবে।'],
    capi: ['Server-side conversion event পাঠিয়ে campaign measurement নির্ভরযোগ্য করুন।', 'উদাহরণ: purchase event server থেকে ad platform-এ পাঠানো হবে।'],
    'personal-mfs': ['Supported personal MFS payment verification automation করুন।', 'উদাহরণ: personal MFS payment website order-এর সঙ্গে match হবে।'],
    'local-gateway': ['Regional customer-এর জন্য local payment method connect করুন।', 'উদাহরণ: local buyer regional gateway দিয়ে checkout করবে।'],
    'international-gateway': ['বিশ্বব্যাপী customer-এর জন্য international payment method connect করুন।', 'উদাহরণ: overseas buyer global method দিয়ে checkout করবে।'],
    notifications: ['Customer ও merchant-কে payment এবং order update পাঠান।', 'উদাহরণ: payment success হলে merchant alert ও customer update যাবে।'],
    courier: ['Confirmed order supported courier workflow-এ automatic পাঠান।', 'উদাহরণ: confirmed COD order courier handoff-এর জন্য প্রস্তুত হবে।'],
    'business-email': ['নিজস্ব branded domain-এ professional email send ও receive করুন।', 'উদাহরণ: sales@acme.com inquiry receive করবে এবং support@acme.com reply করবে।']
  },
  hi: {
    'no-code-website': ['बिना कोडिंग ई-कॉमर्स, शिक्षा, ब्लॉग या न्यूज़ साइट बनाएं।', 'उदाहरण: seller dashboard से landing page और product post प्रकाशित करें।'],
    'custom-domain': ['अपना domain जोड़कर professional digital identity बनाएं।', 'उदाहरण: आपका store platform subdomain के बजाय www.acme.com पर चलेगा।'],
    capi: ['Server-side conversion events से campaign measurement बेहतर बनाएं।', 'उदाहरण: purchase event server से ad platform पर भेजा जाएगा।'],
    'personal-mfs': ['Supported personal MFS payment verification को automate करें।', 'उदाहरण: personal MFS payment website order से match होगी।'],
    'local-gateway': ['Regional customers के लिए local payment methods जोड़ें।', 'उदाहरण: local buyer regional gateway से checkout करेगा।'],
    'international-gateway': ['दुनिया भर के customers के लिए international payment methods जोड़ें।', 'उदाहरण: overseas buyer global method से checkout करेगा।'],
    notifications: ['Customer और merchant को payment और order updates भेजें।', 'उदाहरण: payment success पर merchant alert और customer update मिलेगा।'],
    courier: ['Confirmed order को supported courier workflow में अपने आप भेजें।', 'उदाहरण: confirmed COD order courier handoff के लिए तैयार होगा।'],
    'business-email': ['अपने branded domain पर professional email भेजें और प्राप्त करें।', 'उदाहरण: sales@acme.com inquiry लेगा और support@acme.com reply करेगा।']
  },
  ar: {
    'no-code-website': ['أنشئ مواقع التجارة والتعليم والمدونات بدون برمجة.', 'مثال: انشر صفحة هبوط ومنشور منتج من لوحة البائع.'],
    'custom-domain': ['اربط نطاقك الخاص وابنِ هوية رقمية احترافية.', 'مثال: يعمل متجرك على www.acme.com بدلاً من نطاق المنصة.'],
    capi: ['أرسل أحداث التحويل من الخادم لقياس الحملات بدقة.', 'مثال: يُرسل حدث الشراء من الخادم إلى منصة الإعلانات.'],
    'personal-mfs': ['أتمتة التحقق من مدفوعات MFS الشخصية المدعومة.', 'مثال: تتم مطابقة دفعة MFS مع طلب الموقع.'],
    'local-gateway': ['اربط طرق الدفع المحلية للعملاء في منطقتك.', 'مثال: يكمل العميل المحلي الدفع عبر بوابة إقليمية.'],
    'international-gateway': ['اربط طرق الدفع الدولية للعملاء حول العالم.', 'مثال: يكمل العميل الخارجي الدفع بطريقة عالمية.'],
    notifications: ['أرسل تحديثات الدفع والطلبات للعملاء والتجار.', 'مثال: يرسل نجاح الدفع تنبيهاً للتاجر وتحديثاً للعميل.'],
    courier: ['أرسل الطلبات المؤكدة تلقائياً إلى سير عمل التوصيل.', 'مثال: يُجهز طلب الدفع عند الاستلام للتسليم.'],
    'business-email': ['أرسل واستقبل البريد الاحترافي على نطاقك الخاص.', 'مثال: يستقبل sales@acme.com الاستفسارات ويرد support@acme.com.']
  },
  fr: {
    'no-code-website': ['Créez des sites e-commerce, éducatifs ou de blog sans coder.', 'Exemple : publiez une landing page et un produit depuis le tableau de bord.'],
    'custom-domain': ['Connectez votre domaine et construisez une identité numérique professionnelle.', 'Exemple : votre boutique utilise www.acme.com plutôt qu’un sous-domaine.'],
    capi: ['Envoyez les conversions côté serveur pour mesurer les campagnes.', 'Exemple : l’achat est envoyé du serveur à la plateforme publicitaire.'],
    'personal-mfs': ['Automatisez la vérification des paiements MFS personnels pris en charge.', 'Exemple : le paiement MFS est associé à la commande du site.'],
    'local-gateway': ['Connectez les moyens de paiement locaux de vos clients.', 'Exemple : un client régional paie avec une passerelle locale.'],
    'international-gateway': ['Connectez les moyens de paiement internationaux.', 'Exemple : un client étranger paie avec une méthode mondiale.'],
    notifications: ['Envoyez les mises à jour de paiement et de commande.', 'Exemple : le paiement réussi déclenche une alerte marchand et client.'],
    courier: ['Envoyez automatiquement les commandes confirmées au transporteur.', 'Exemple : une commande contre remboursement est préparée pour livraison.'],
    'business-email': ['Envoyez et recevez des emails professionnels sur votre domaine.', 'Exemple : sales@acme.com reçoit les demandes et support@acme.com répond.']
  },
  es: {
    'no-code-website': ['Crea sitios de comercio, educación, blogs o noticias sin programar.', 'Ejemplo: publica una landing page y un producto desde el panel del vendedor.'],
    'custom-domain': ['Conecta tu dominio y crea una identidad digital profesional.', 'Ejemplo: tu tienda funciona en www.acme.com y no en un subdominio.'],
    capi: ['Envía conversiones desde el servidor para medir campañas con precisión.', 'Ejemplo: el evento de compra se envía del servidor a la plataforma publicitaria.'],
    'personal-mfs': ['Automatiza la verificación de pagos MFS personales compatibles.', 'Ejemplo: el pago MFS se relaciona con el pedido del sitio.'],
    'local-gateway': ['Conecta métodos de pago locales para clientes regionales.', 'Ejemplo: un comprador local paga mediante una pasarela regional.'],
    'international-gateway': ['Conecta métodos de pago internacionales para clientes globales.', 'Ejemplo: un comprador extranjero paga con un método internacional.'],
    notifications: ['Envía actualizaciones de pagos y pedidos a clientes y comercios.', 'Ejemplo: un pago exitoso genera una alerta y una actualización.'],
    courier: ['Envía automáticamente los pedidos confirmados al transportista.', 'Ejemplo: un pedido contra reembolso queda listo para la entrega.'],
    'business-email': ['Envía y recibe correo profesional con tu propio dominio.', 'Ejemplo: sales@acme.com recibe consultas y support@acme.com responde.']
  },
  pt: {
    'no-code-website': ['Crie sites de e-commerce, educação, blogs ou notícias sem programar.', 'Exemplo: publique uma landing page e um produto no painel do vendedor.'],
    'custom-domain': ['Conecte seu domínio e crie uma identidade digital profissional.', 'Exemplo: sua loja funciona em www.acme.com, não em um subdomínio.'],
    capi: ['Envie conversões pelo servidor para medir campanhas com precisão.', 'Exemplo: o evento de compra é enviado do servidor para a plataforma de anúncios.'],
    'personal-mfs': ['Automatize a verificação de pagamentos MFS pessoais compatíveis.', 'Exemplo: o pagamento MFS é associado ao pedido do site.'],
    'local-gateway': ['Conecte métodos de pagamento locais para clientes regionais.', 'Exemplo: o comprador local paga por um gateway regional.'],
    'international-gateway': ['Conecte métodos de pagamento internacionais para clientes globais.', 'Exemplo: o comprador estrangeiro paga com um método global.'],
    notifications: ['Envie atualizações de pagamento e pedidos para clientes e lojistas.', 'Exemplo: o pagamento aprovado gera um alerta e uma atualização.'],
    courier: ['Envie automaticamente os pedidos confirmados para a transportadora.', 'Exemplo: um pedido contra entrega fica pronto para envio.'],
    'business-email': ['Envie e receba e-mails profissionais no seu próprio domínio.', 'Exemplo: sales@acme.com recebe consultas e support@acme.com responde.']
  }
};

const sectionCopy: Partial<Record<MarketingLanguage, Record<string, [string, string]>>> = {
  en: { scale: ['Unlimited Scaling', 'Businesses with a Trade License and TIN can receive unlimited payments through merchant MFS, bank, or card—fully automated for digital commerce.'], personal: ['No Trade License?', 'Start receiving payments with Personal MFS, create your digital identity, and begin e-commerce without unnecessary complexity.'], physical: ['Physical Shop and Online', 'Keep digital records and sell online from your physical shop or office with direct QR payment support.'] },
  bn: { scale: ['আনলিমিটেড স্কেলিং', 'Trade License ও TIN থাকা ব্যবসা merchant MFS, bank বা card দিয়ে সীমাহীন payment receive করতে পারবে—ডিজিটাল commerce-এর জন্য সম্পূর্ণ automation।'], personal: ['Trade License নেই?', 'Personal MFS দিয়ে payment receive শুরু করুন, digital identity তৈরি করুন এবং সহজে e-commerce শুরু করুন।'], physical: ['Physical Shop ও Online', 'নিজস্ব দোকান বা office থেকে digital হিসাব রাখুন এবং QR payment support-সহ online-এ বিক্রি করুন।'] },
  hi: { scale: ['Unlimited Scaling', 'Trade License और TIN वाले व्यवसाय merchant MFS, bank या card से unlimited payments ले सकते हैं—digital commerce के लिए पूरी automation।'], personal: ['Trade License नहीं है?', 'Personal MFS से payments लेना शुरू करें, digital identity बनाएं और आसानी से e-commerce शुरू करें।'], physical: ['Physical Shop और Online', 'अपनी दुकान या office से digital records रखें और QR payment support के साथ online बेचें।'] },
  ar: { scale: ['توسع غير محدود', 'يمكن للشركات التي لديها التراخيص اللازمة استقبال مدفوعات غير محدودة عبر MFS أو البنك أو البطاقة مع أتمتة كاملة.'], personal: ['لا تملك رخصة تجارية؟', 'ابدأ باستقبال المدفوعات عبر Personal MFS وأنشئ هويتك الرقمية وابدأ التجارة الإلكترونية بسهولة.'], physical: ['المتجر الفعلي والإنترنت', 'احتفظ بسجلات رقمية وبع عبر الإنترنت من متجرك مع دعم الدفع المباشر عبر QR.'] },
  fr: { scale: ['Mise à l’échelle illimitée', 'Les entreprises enregistrées peuvent recevoir des paiements illimités par MFS, banque ou carte avec une automatisation complète.'], personal: ['Pas de licence commerciale ?', 'Commencez à recevoir des paiements avec Personal MFS et créez votre identité numérique facilement.'], physical: ['Boutique physique et en ligne', 'Gérez vos registres et vendez en ligne depuis votre boutique avec le paiement QR.'] },
  es: { scale: ['Escalabilidad ilimitada', 'Las empresas registradas pueden recibir pagos ilimitados por MFS, banco o tarjeta con automatización completa.'], personal: ['¿Sin licencia comercial?', 'Empieza a recibir pagos con Personal MFS, crea tu identidad digital y comienza tu comercio online.'], physical: ['Tienda física y online', 'Lleva registros digitales y vende online desde tu tienda con pagos directos por QR.'] },
  pt: { scale: ['Escala ilimitada', 'Empresas registradas podem receber pagamentos ilimitados por MFS, banco ou cartão com automação completa.'], personal: ['Sem licença comercial?', 'Comece a receber pagamentos com Personal MFS, crie sua identidade digital e inicie seu e-commerce.'], physical: ['Loja física e online', 'Mantenha registros digitais e venda online da sua loja com pagamento direto por QR.'] }
};

const tickerCopy: Partial<Record<MarketingLanguage, string>> = {
  en: '1. Personal MFS: for users without a Trade License or TIN. Sell digital and physical products and accept advance payments. • 2. Merchant MFS/Bank/Card: for licensed merchants. Receive unlimited payments and sell digital and physical products. • 3. Bangla QR: accept QR payments in physical shops and keep digital records while selling online.',
  bn: '১. Personal MFS: Trade License বা TIN Certificate না থাকা ব্যবহারকারীদের জন্য। ডিজিটাল ও physical product বিক্রি করে advance payment নিন। • ২. Merchant MFS/Bank/Card: licensed merchant-এর জন্য unlimited payment receive করুন। • ৩. Bangla QR: physical shop-এ QR payment নিন এবং online-এও বিক্রি করুন।',
  hi: '1. Personal MFS: Trade License या TIN के बिना users के लिए। Digital और physical products बेचें और advance payments लें। • 2. Merchant MFS/Bank/Card: licensed merchants के लिए unlimited payments। • 3. Bangla QR: physical shops में QR payments लें और online भी बेचें।',
  ar: '1. Personal MFS: للمستخدمين بدون رخصة تجارية أو TIN، لبيع المنتجات واستقبال الدفعات المقدمة. • 2. Merchant MFS/Bank/Card: للتجار المرخصين لاستقبال مدفوعات غير محدودة. • 3. Bangla QR: اقبل مدفوعات QR في المتجر وبع عبر الإنترنت.',
  fr: '1. Personal MFS : pour les utilisateurs sans licence commerciale ou TIN, afin de vendre et recevoir des avances. • 2. Merchant MFS/Bank/Card : pour les commerçants enregistrés. • 3. Bangla QR : acceptez les paiements QR en boutique et vendez aussi en ligne.',
  es: '1. Personal MFS: para usuarios sin licencia comercial o TIN; vende productos y recibe anticipos. • 2. Merchant MFS/Bank/Card: para comercios registrados con pagos ilimitados. • 3. Bangla QR: acepta pagos QR en tiendas físicas y vende online.',
  pt: '1. Personal MFS: para usuários sem licença comercial ou TIN; venda produtos e aceite pagamentos antecipados. • 2. Merchant MFS/Bank/Card: para comerciantes registrados. • 3. Bangla QR: aceite pagamentos QR na loja e venda também online.'
};

const languageAliases: Record<string, MarketingLanguage> = {
  eng: 'en', en: 'en', english: 'en',
  ben: 'bn', bn: 'bn', bengali: 'bn', bangla: 'bn',
  hin: 'hi', hi: 'hi', hindi: 'hi',
  ara: 'ar', ar: 'ar', arabic: 'ar',
  fra: 'fr', fre: 'fr', fr: 'fr', french: 'fr',
  spa: 'es', es: 'es', spanish: 'es',
  por: 'pt', pt: 'pt', portuguese: 'pt',
  zho: 'zh', chi: 'zh', zh: 'zh', chinese: 'zh', mandarin: 'zh',
  deu: 'de', ger: 'de', de: 'de', german: 'de',
  jpn: 'ja', ja: 'ja', japanese: 'ja',
  kor: 'ko', ko: 'ko', korean: 'ko',
  rus: 'ru', ru: 'ru', russian: 'ru',
  tur: 'tr', tr: 'tr', turkish: 'tr',
  tam: 'ta', ta: 'ta', tamil: 'ta',
  tel: 'te', te: 'te', telugu: 'te',
  urd: 'ur', ur: 'ur', urdu: 'ur',
  ita: 'it', it: 'it', italian: 'it',
  nld: 'nl', dut: 'nl', nl: 'nl', dutch: 'nl',
  tha: 'th', th: 'th', thai: 'th',
  vie: 'vi', vi: 'vi', vietnamese: 'vi',
  ukr: 'uk', uk: 'uk', ukrainian: 'uk',
  pol: 'pl', pl: 'pl', polish: 'pl',
  ell: 'el', el: 'el', greek: 'el',
  heb: 'he', he: 'he', hebrew: 'he',
  nep: 'ne', ne: 'ne', nepali: 'ne',
  sin: 'si', si: 'si', sinhala: 'si',
  swe: 'sv', sv: 'sv', swedish: 'sv',
  dan: 'da', da: 'da', danish: 'da'
};
const globalLanguages = [
  { value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }, { value: 'es', label: 'Español' }, { value: 'fr', label: 'Français' },
  { value: 'zh', label: '中文' }, { value: 'hi', label: 'हिन्दी' }, { value: 'bn', label: 'বাংলা' }, { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' }, { value: 'de', label: 'Deutsch' }, { value: 'ja', label: '日本語' }, { value: 'ko', label: '한국어' }, { value: 'tr', label: 'Türkçe' },
  { value: 'ta', label: 'தமிழ்' }, { value: 'te', label: 'తెలుగు' }, { value: 'ur', label: 'اردو' }, { value: 'it', label: 'Italiano' },
  { value: 'nl', label: 'Nederlands' }, { value: 'th', label: 'ไทย' }, { value: 'vi', label: 'Tiếng Việt' }, { value: 'uk', label: 'Українська' },
  { value: 'pl', label: 'Polski' }, { value: 'el', label: 'Ελληνικά' }, { value: 'he', label: 'עברית' }, { value: 'ne', label: 'नेपाली' },
  { value: 'si', label: 'සිංහල' }, { value: 'sv', label: 'Svenska' }, { value: 'da', label: 'Dansk' }
];
const globalLanguageLabels = new Map(globalLanguages.map((language) => [language.value, language.label]));

const canonicalLanguage = (code: string, name?: string): string => {
  const normalizedCode = code.trim().toLowerCase();
  const normalizedName = name?.trim().toLowerCase();
  return languageAliases[normalizedCode] || (normalizedName ? languageAliases[normalizedName] : undefined) || normalizedCode;
};
const getExtendedCopy = (language: MarketingLanguage | string) => (extendedCopy as Record<string, any>)[canonicalLanguage(language)];
// The country dataset is the source of truth for locale selection. Translation
// coverage may be narrower than the selector, but no native country language
// should be hidden from the user. Common global languages are added below.

export const getLanguageOptions = (continent: Continent) => languageOptions[continent] || languageOptions.unknown;
export const getDefaultLanguage = (continent: Continent) => defaultLanguage[continent] || 'en';
export const getHeroChunks = (language: MarketingLanguage | string) => getExtendedCopy(language)?.hero || hero[canonicalLanguage(language) as MarketingLanguage] || hero.en;
export const getFeatureCopy = (id: string, language: MarketingLanguage | string): [string, string] => getExtendedCopy(language)?.features?.[id] || featureCopy[canonicalLanguage(language) as MarketingLanguage]?.[id] || featureCopy.en[id] || ['', ''];
export const getSectionCopy = (key: 'scale' | 'personal' | 'physical', language: MarketingLanguage | string) => getExtendedCopy(language)?.sections?.[key] || sectionCopy[canonicalLanguage(language) as MarketingLanguage]?.[key] || sectionCopy.en[key];
export const getTickerCopy = (language: MarketingLanguage | string) => getExtendedCopy(language)?.ticker || tickerCopy[canonicalLanguage(language) as MarketingLanguage] || tickerCopy.en;

export const getCountryLanguageOptions = (country?: CountryLanguage, continentCountries: CountryLanguage[] = []) => {
  const allLanguages = [...(country?.languages || []), ...continentCountries.flatMap((item) => item.languages)];
  const options = new Map<string, { value: string; label: string }>();
  allLanguages.forEach((language) => {
    const value = canonicalLanguage(language.code, language.name);
    if (!options.has(value)) options.set(value, { value, label: globalLanguageLabels.get(value) || language.name });
  });
  globalLanguages.forEach((language) => { if (!options.has(language.value)) options.set(language.value, language); });
  return Array.from(options.values());
};

export const getDefaultCountryLanguage = (country?: CountryLanguage) => {
  const countryLanguages = (country?.languages || [])
    .map((language) => canonicalLanguage(language.code, language.name));
  // Prefer the selected country's first native language; use English only when
  // the country dataset has no language entry.
  return countryLanguages.find((language) => language !== 'en') || countryLanguages[0] || 'en';
};

export const loadCountriesByContinent = async (continent: Continent): Promise<CountryLanguage[]> => {
  const response = await fetch('https://raw.githubusercontent.com/mledoze/countries/master/countries.json');
  if (!response.ok) throw new Error('country list unavailable');
  const data = await response.json() as { cca2?: string; name?: { common?: string }; region?: string; subregion?: string; languages?: Record<string, string> }[];
  const belongsToContinent = (country: typeof data[number]) => {
    if (continent === 'unknown') return false;
    if (continent === 'north-america') return country.region === 'Americas' && country.subregion !== 'South America';
    if (continent === 'south-america') return country.region === 'Americas' && country.subregion === 'South America';
    return country.region === continent[0].toUpperCase() + continent.slice(1);
  };
  return data
    .filter((country) => belongsToContinent(country) && country.cca2 && country.name?.common)
    .map((country) => ({
      code: country.cca2!,
      name: country.name!.common!,
      languages: Object.entries(country.languages || {}).map(([code, name]) => ({ code, name }))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
