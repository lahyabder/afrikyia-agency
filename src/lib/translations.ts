export type Language = 'en' | 'fr' | 'ar';

export const translations = {
    en: {
        nav: {
            vision: "Vision",
            services: "Services",
            achievements: "Achievements",
            casting: "Casting",
            impact: "Impact",
            discover: "Discover Our Vision"
        },
        hero: {
            slogan: "Intelligent Making",
            desc: "A digital company bridging heritage and future technologies.",
            cta: "Discover Our Vision",
            scroll: "Scroll"
        },
        vision: {
            tag: "Our Philosophy",
            title: "Intelligent Making: Beyond Artificial Intelligence.",
            desc1: "At Afrikyia, \"Intelligent Making\" is a fundamental shift in perception. Because true intelligence is not merely a product of algorithms; it is a deliberate act of cultural crafting.",
            desc2: "It is the intentional use of technical and creative forces to reshape our digital reality through the lens of identity, heritage, and human action, transforming technology into a cultural vessel."
        },
        services: {
            tag: "Our Expertise",
            title: "Solutions for a Digital Culture",
            list: [
                { title: "Cultural Content Production & Development", desc: "" },
                { title: "Memory & Identity Documentation", desc: "" },
                { title: "AI & Platform Solutions", desc: "" },
                { title: "Audiovisual Libraries", desc: "" },
                { title: "Strategic Consulting", desc: "" },
                { title: "Exhibitions & Events", desc: "" },
                { title: "Digital & Print Publishing", desc: "" },
                { title: "Creative Training & Education", desc: "" },
                { title: "Project Management", desc: "" }
            ]
        },
        achievements: {
            tag: "Our Achievements",
            title: "Completed Projects & Activities",
            filters: {
                all: "All",
                websites: "Websites",
                activities: "Activities",
                works: "Creative Works"
            },
            list: [
                {
                    title: "TDM Digital Portal",
                    category: "websites",
                    categoryLabel: "Website",
                    desc: "A comprehensive high-performance digital gateway for telecommunications and media services, facilitating public and administrative interaction.",
                    link: "https://tdm.mr"
                },
                {
                    title: "Cultural Heritage Map",
                    category: "websites",
                    categoryLabel: "Platform",
                    desc: "An interactive digital mapping platform documenting historical sites and cultural heritage using advanced GIS technologies.",
                    link: "https://culturalmap.org"
                },
                {
                    title: "Saudi Music Gateway",
                    category: "websites",
                    categoryLabel: "Digital Portal",
                    desc: "A modern, high-contrast cultural gateway showcasing Saudi musical heritage and connecting industry professionals.",
                    link: "https://saudimusic.gov.sa"
                },
                {
                    title: "Bankily Agent Ledger",
                    category: "works",
                    categoryLabel: "Web App",
                    desc: "A secure offline-first digital agent ledger tracking financial transactions, commission brackets, and daily balances.",
                    link: "#"
                },
                {
                    title: "La Medina Management",
                    category: "works",
                    categoryLabel: "System",
                    desc: "An advanced hotel and hospitality management system designed for seamless daily operations and booking administration.",
                    link: "#"
                },
                {
                    title: "Digital Art & Cultural Sovereignty",
                    category: "activities",
                    categoryLabel: "Activity",
                    desc: "A digital initiative showcasing modern creative works and supporting local creators in asserting sovereignty in the global creator economy.",
                    link: "#"
                }
            ]
        },
        impact: {
            tag: "Strategic Impact",
            title: "Shaping the Global Narrative",
            desc: "Afrikyia operates at the intersection of creative economy and digital sovereignty, building a sustainable ecosystem for cultural expression.",
            list: [
                { label: "Cultural", value: "Bridging Heritage & Future" },
                { label: "Economic", value: "Creative Transformation" },
                { label: "Digital", value: "Intelligent Making" },
                { label: "Global", value: "Borderless Identity" }
            ]
        },
        footer: {
            motto: "A digital frontier for creative sovereignty.",
            rights: "© 2026 AFRIKYia – ALL RIGHTS RESERVED",
            privacy: "Privacy Policy",
            terms: "Legal Terms"
        },
        admin: {
            menu: {
                dashboard: "Dashboard",
                clients: "Clients",
                offers: "Offers",
                invoices: "Invoices",
                deliveryNotes: "Delivery Notes",
                files: "Files",
                achievements: "Achievements",
                users: "Users",
                settings: "Settings",
                logout: "Logout",
                backToSite: "Back to Site"
            },
            common: {
                search: "Search...",
                add: "Add",
                save: "Save",
                cancel: "Cancel",
                delete: "Delete",
                edit: "Edit",
                actions: "Actions",
                status: "Status",
                date: "Date",
                amount: "Amount",
                back: "Back",
                soon: "Coming Soon",
                preview: "Preview",
                convertToInvoice: "Convert to Invoice",
                draft: "Draft",
                sent: "Sent",
                accepted: "Accepted",
                rejected: "Rejected",
                paid: "Paid",
                unpaid: "Unpaid",
                overdue: "Overdue",
                signed: "Signed",
                active: "Active",
                inactive: "Inactive",
                reference: "Reference"
            },
            dashboard: {
                title: "Dashboard",
                subtitle: "Overview of Afrikyia agency",
                createOffer: "Create New Offer",
                recentActivity: "Recent Activity",
                noActivity: "No recent activity to display.",
                statClients: "Clients",
                statOffers: "Open Offers",
                statInvoices: "Total Invoices",
                statAchievements: "Achievements & Projects"
            },
            clients: {
                title: "Clients",
                addClient: "Add Client",
                noClients: "No clients available currently.",
                noClientsSub: "All registered clients will appear here.",
                newTitle: "Add New Client",
                newSub: "Enter client details to add them to the system.",
                clientName: "Client Name (Company Rep)",
                clientNamePlaceholder: "e.g., John Doe",
                companyName: "Company / Organization Name",
                companyNamePlaceholder: "e.g., TDM",
                email: "Email Address",
                emailPlaceholder: "email@example.com",
                phone: "Phone Number",
                phonePlaceholder: "+222 40 00 00 00",
                clientStatus: "Client Status",
                saveClient: "Save Client Data",
                saving: "Saving..."
            },
            offers: {
                title: "Offers",
                addOffer: "New Offer",
                noOffers: "No offers available currently.",
                noOffersSub: "All offers will appear here.",
                newTitle: "Add New Offer",
                newSub: "Fill in the offer details to add it.",
                clientName: "Client Name",
                clientNamePlaceholder: "e.g., Al Noor Company",
                refPlaceholder: "Q-2026-...",
                amountPlaceholder: "e.g., 50000",
                description: "Detailed Description",
                descriptionPlaceholder: "Details of the offer and project...",
                saveOffer: "Save Offer",
                saving: "Saving..."
            },
            invoices: {
                title: "Invoices",
                addInvoice: "New Invoice",
                noInvoices: "No invoices available currently.",
                noInvoicesSub: "All invoices will appear here.",
                newTitle: "Add New Invoice",
                newSub: "Fill in the invoice details to add it.",
                saveInvoice: "Save Invoice",
                saving: "Saving...",
                confirmPayment: "Confirm Payment",
                downloadPDF: "Download PDF"
            },
            deliveryNotes: {
                title: "Delivery Notes",
                addNote: "New Delivery Note",
                noNotes: "No delivery notes available currently.",
                noNotesSub: "All delivery notes will appear here once added.",
                newTitle: "Add New Delivery Note",
                newSub: "Fill in the delivery note details to add it.",
                notesAndDetails: "Notes & Details",
                notesPlaceholder: "Details of products or services delivered...",
                saveNote: "Save Delivery Note",
                saving: "Saving..."
            },
            files: {
                title: "Files",
                addFile: "Upload New File",
                noFiles: "No uploaded files currently.",
                noFilesSub: "All documents and files will be displayed here.",
                newTitle: "Upload New File",
                newSub: "Select a file and enter details to upload.",
                chooseFile: "Choose File",
                uploadHintTitle: "Click here to select a file or drag & drop",
                uploadHintSub: "Supports PDF, DOCX, Images (Max 10MB)",
                fileName: "File Name",
                fileNamePlaceholder: "e.g., Partnership Agreement - TDM",
                category: "Category",
                catDocument: "Documents & Contracts",
                catInvoice: "Invoice Attachments",
                catDesign: "Designs & Assets",
                catOther: "Other",
                description: "Description (Optional)",
                descriptionPlaceholder: "Brief file description...",
                saveFile: "Upload File",
                saving: "Uploading..."
            },
            users: {
                title: "Users",
                addUser: "Add User",
                editPermissions: "Edit Permissions",
                adminRole: "Admin"
            },
            settings: {
                title: "Settings",
                saveChanges: "Save Changes",
                accountSettings: "Account Settings",
                username: "Username",
                newPassword: "New Password",
                passwordHint: "Leave empty to keep current password",
                systemPrefs: "System Preferences",
                notifications: "Notifications",
                notificationsHint: "Receive notifications for new offers",
                darkMode: "Dark Mode",
                darkModeHint: "Enable dark mode permanently"
            },
            auth: {
                loginTitle: "Admin Portal",
                loginSub: "Dashboard",
                enterCode: "Enter verification code (Admin code)",
                passwordPlaceholder: "Verification code (e.g: afrikyia2026)",
                incorrectPassword: "Incorrect Password",
                loginButton: "Enter Admin Panel"
            },
            achievements: {
                title: "Achievements Management",
                subtitle: "Edit and add completed websites, works and activities",
                totalAchievements: "Total Achievements",
                websites: "Websites",
                activities: "Activities & Events",
                works: "Apps & Works",
                searchPlaceholder: "Search titles and descriptions...",
                filterAll: "All",
                filterWebsites: "Websites",
                filterActivities: "Activities",
                filterWorks: "Works",
                addNew: "Add New Achievement",
                noMatches: "No matching works or activities found.",
                nameCol: "Achievement Name",
                categoryCol: "Category",
                linkCol: "Link",
                actionsCol: "Actions",
                noLink: "No link"
            }
        }
    },
    fr: {
        nav: {
            vision: "Vision",
            services: "Services",
            achievements: "Réalisations",
            casting: "Casting",
            impact: "Impact",
            discover: "Découvrir Notre Vision"
        },
        hero: {
            slogan: "L'Artifice Intelligent",
            desc: "Une entreprise numérique qui fait converger héritage et technologies d'avenir.",
            cta: "Découvrir Notre Vision",
            scroll: "Défiler"
        },
        vision: {
            tag: "Notre Philosophie",
            title: "L'Artifice Intelligent : Au-delà de l'Intelligence Artificielle.",
            desc1: "Chez Afrikyia, « L'Artifice Intelligent » est un changement fondamental de perception. Car la véritable intelligence n'est pas simplement un produit d'algorithmes ; c'est un acte délibéré de façonnage culturel.",
            desc2: "C'est l'utilisation intentionnelle des forces techniques et créatives pour remodeler notre réalité numérique à travers le prisme de l'identité, du patrimoine et de l'action humaine, pour transformer la technologie en un véhicule culturel."
        },
        services: {
            tag: "Notre Expertise",
            title: "Solutions pour une Culture Numérique",
            list: [
                { title: "Production et Développement de Contenu Culturel", desc: "" },
                { title: "Documentation de la Mémoire et de l'Identité", desc: "" },
                { title: "Solutions IA & Plateformes", desc: "" },
                { title: "Bibliothèques Audiovisuelles", desc: "" },
                { title: "Conseil Stratégique", desc: "" },
                { title: "Expositions & Événements", desc: "" },
                { title: "Édition Numérique & Papier", desc: "" },
                { title: "Formation et Éducation Créative", desc: "" },
                { title: "Gestion de Projet", desc: "" }
            ]
        },
        achievements: {
            tag: "Nos Réalisations",
            title: "Projets et Activités Réalisés",
            filters: {
                all: "Tout",
                websites: "Sites Web",
                activities: "Activités",
                works: "Œuvres Créatives"
            },
            list: [
                {
                    title: "Portail Numérique TDM",
                    category: "websites",
                    categoryLabel: "Site Web",
                    desc: "Un portail numérique complet et performant pour les services de télécommunications et de médias, facilitant l'interaction publique et administrative.",
                    link: "https://tdm.mr"
                },
                {
                    title: "Carte du Patrimoine Culturel",
                    category: "websites",
                    categoryLabel: "Plateforme",
                    desc: "Une plateforme de cartographie numérique interactive documentant les sites historiques et le patrimoine culturel à l'aide de technologies SIG avancées.",
                    link: "https://culturalmap.org"
                },
                {
                    title: "Portail de la Musique Saoudienne",
                    category: "websites",
                    categoryLabel: "Portail Numérique",
                    desc: "Un portail culturel moderne à fort contraste mettant en valeur le patrimoine musical saoudien et connectant les professionnels de l'industrie.",
                    link: "https://saudimusic.gov.sa"
                },
                {
                    title: "Carnet d'Agent Bankily",
                    category: "works",
                    categoryLabel: "App Web",
                    desc: "Un registre d'agent numérique sécurisé et offline-first pour le suivi des transactions financières, des tranches de commission et des soldes.",
                    link: "#"
                },
                {
                    title: "Gestion de La Medina",
                    category: "works",
                    categoryLabel: "Système",
                    desc: "Un système avancé de gestion hôtelière et de réception conçu pour des opérations quotidiennes fluides et l'administration des réservations.",
                    link: "#"
                },
                {
                    title: "Art Numérique & Souveraineté Culturelle",
                    category: "activities",
                    categoryLabel: "Activité",
                    desc: "Une initiative numérique présentant des œuvres créatives modernes et aidant les créateurs locaux à s'affirmer dans l'économie créative mondiale.",
                    link: "#"
                }
            ]
        },
        impact: {
            tag: "Impact Stratégique",
            title: "Façonner le Récit Mondial",
            desc: "Afrikyia opère à l'intersection de l'économie créative et de la souveraineté numérique, construisant un écosystème durable pour l'expression culturelle.",
            list: [
                { label: "Culturel", value: "Relier Patrimoine & Futur" },
                { label: "Économique", value: "Transformation Créative" },
                { label: "Numérique", value: "L'Artifice Intelligent" },
                { label: "Mondial", value: "Identité sans Frontières" }
            ]
        },
        footer: {
            motto: "Un horizon numérique pour la souveraineté créative.",
            rights: "© 2026 AFRIKYia – TOUS DROITS RÉSERVÉS",
            privacy: "Politique de Confidentialité",
            terms: "Mentions Légales"
        },
        admin: {
            menu: {
                dashboard: "Tableau de Bord",
                clients: "Clients",
                offers: "Offres",
                invoices: "Factures",
                deliveryNotes: "Bons de Livraison",
                files: "Fichiers",
                achievements: "Réalisations",
                users: "Utilisateurs",
                settings: "Paramètres",
                logout: "Se Déconnecter",
                backToSite: "Retour au Site"
            },
            common: {
                search: "Rechercher...",
                add: "Ajouter",
                save: "Enregistrer",
                cancel: "Annuler",
                delete: "Supprimer",
                edit: "Modifier",
                actions: "Actions",
                status: "Statut",
                date: "Date",
                amount: "Montant",
                back: "Retour",
                soon: "Bientôt Disponible",
                preview: "Aperçu",
                convertToInvoice: "Convertir en Facture",
                draft: "Brouillon",
                sent: "Envoyé",
                accepted: "Accepté",
                rejected: "Rejeté",
                paid: "Payé",
                unpaid: "Non Payé",
                overdue: "En Retard",
                signed: "Signé",
                active: "Actif",
                inactive: "Inactif",
                reference: "Référence"
            },
            dashboard: {
                title: "Tableau de Bord",
                subtitle: "Aperçu de l'agence Afrikyia",
                createOffer: "Créer une Nouvelle Offre",
                recentActivity: "Activité Récente",
                noActivity: "Aucune activité récente à afficher.",
                statClients: "Clients",
                statOffers: "Offres Ouvertes",
                statInvoices: "Total des Factures",
                statAchievements: "Projets & Réalisations"
            },
            clients: {
                title: "Clients",
                addClient: "Ajouter un Client",
                noClients: "Aucun client disponible actuellement.",
                noClientsSub: "Tous les clients enregistrés apparaîtront ici.",
                newTitle: "Ajouter un Nouveau Client",
                newSub: "Saisissez les détails du client pour l'ajouter au système.",
                clientName: "Nom du Client (Représentant)",
                clientNamePlaceholder: "ex: Jean Dupont",
                companyName: "Nom de l'Entreprise / Organisation",
                companyNamePlaceholder: "ex: TDM",
                email: "Adresse E-mail",
                emailPlaceholder: "email@exemple.com",
                phone: "Numéro de Téléphone",
                phonePlaceholder: "+222 40 00 00 00",
                clientStatus: "Statut du Client",
                saveClient: "Enregistrer le Client",
                saving: "Enregistrement..."
            },
            offers: {
                title: "Offres",
                addOffer: "Nouvelle Offre",
                noOffers: "Aucune offre disponible actuellement.",
                noOffersSub: "Toutes les offres apparaîtront ici.",
                newTitle: "Ajouter une Nouvelle Offre",
                newSub: "Remplissez les détails de l'offre pour l'ajouter.",
                clientName: "Nom du Client",
                clientNamePlaceholder: "ex: Entreprise Al Noor",
                refPlaceholder: "Q-2026-...",
                amountPlaceholder: "ex: 50000",
                description: "Description Détaillée",
                descriptionPlaceholder: "Détails de l'offre et du projet...",
                saveOffer: "Enregistrer l'Offre",
                saving: "Enregistrement..."
            },
            invoices: {
                title: "Factures",
                addInvoice: "Nouvelle Facture",
                noInvoices: "Aucune facture disponible actuellement.",
                noInvoicesSub: "Toutes les factures apparaîtront ici.",
                newTitle: "Ajouter une Nouvelle Facture",
                newSub: "Remplissez les détails de la facture pour l'ajouter.",
                saveInvoice: "Enregistrer la Facture",
                saving: "Enregistrement...",
                confirmPayment: "Confirmer le Paiement",
                downloadPDF: "Télécharger PDF"
            },
            deliveryNotes: {
                title: "Bons de Livraison",
                addNote: "Nouveau Bon de Livraison",
                noNotes: "Aucun bon de livraison disponible actuellement.",
                noNotesSub: "Tous les bons de livraison apparaîtront ici une fois ajoutés.",
                newTitle: "Ajouter un Nouveau Bon de Livraison",
                newSub: "Remplissez les détails du bon de livraison pour l'ajouter.",
                notesAndDetails: "Notes et Détails",
                notesPlaceholder: "Détails des produits ou services livrés...",
                saveNote: "Enregistrer le Bon",
                saving: "Enregistrement..."
            },
            files: {
                title: "Fichiers",
                addFile: "Téléverser un Nouveau Fichier",
                noFiles: "Aucun fichier téléversé actuellement.",
                noFilesSub: "Tous les documents et fichiers apparaîtront ici.",
                newTitle: "Téléverser un Nouveau Fichier",
                newSub: "Sélectionnez un fichier et entrez les détails pour téléverser.",
                chooseFile: "Choisir un Fichier",
                uploadHintTitle: "Cliquez ici pour sélectionner un fichier ou glissez-déposez",
                uploadHintSub: "Prend en charge PDF, DOCX, Images (Max 10Mo)",
                fileName: "Nom du Fichier",
                fileNamePlaceholder: "ex: Contrat de Partenariat - TDM",
                category: "Catégorie",
                catDocument: "Documents & Contrats",
                catInvoice: "Pièces Jointes de Factures",
                catDesign: "Designs & Ressources",
                catOther: "Autre",
                description: "Description (Optionnel)",
                descriptionPlaceholder: "Brève description du fichier...",
                saveFile: "Téléverser le Fichier",
                saving: "Téléversement..."
            },
            users: {
                title: "Utilisateurs",
                addUser: "Ajouter un Utilisateur",
                editPermissions: "Modifier les Permissions",
                adminRole: "Administrateur"
            },
            settings: {
                title: "Paramètres",
                saveChanges: "Enregistrer les Modifications",
                accountSettings: "Paramètres du Compte",
                username: "Nom d'Utilisateur",
                newPassword: "Nouveau Mot de Passe",
                passwordHint: "Laissez vide pour conserver le mot de passe actuel",
                systemPrefs: "Préférences Système",
                notifications: "Notifications",
                notificationsHint: "Recevoir des notifications pour les nouvelles offres",
                darkMode: "Mode Sombre",
                darkModeHint: "Activer le mode sombre en permanence"
            },
            auth: {
                loginTitle: "Portail d'Administration",
                loginSub: "Tableau de Bord",
                enterCode: "Entrez le code de vérification",
                passwordPlaceholder: "Code de vérification (ex: afrikyia2026)",
                incorrectPassword: "Mot de passe incorrect",
                loginButton: "Entrer dans l'Administration"
            },
            achievements: {
                title: "Gestion des Réalisations",
                subtitle: "Modifier et ajouter des sites web, des œuvres et des activités réalisés",
                totalAchievements: "Total des Réalisations",
                websites: "Sites Web",
                activities: "Activités & Événements",
                works: "Apps & Œuvres",
                searchPlaceholder: "Rechercher titres et descriptions...",
                filterAll: "Tout",
                filterWebsites: "Sites Web",
                filterActivities: "Activités",
                filterWorks: "Œuvres",
                addNew: "Ajouter une Nouvelle Réalisation",
                noMatches: "Aucune œuvre ou activité correspondante trouvée.",
                nameCol: "Nom de la Réalisation",
                categoryCol: "Catégorie",
                linkCol: "Lien",
                actionsCol: "Actions",
                noLink: "Pas de lien"
            }
        }
    },
    ar: {
        nav: {
            vision: "الرؤية",
            services: "الخدمات",
            achievements: "الإنجازات",
            casting: "كاستينغ",
            impact: "التأثير",
            discover: "اكتشف رؤيتنا"
        },
        hero: {
            slogan: "الاصطناع الذكي",
            desc: "شركة رقمية تآزر بين التراث والتقنيات المستقبلية.",
            cta: "اكتشف رؤيتنا",
            scroll: "مرر لأسفل"
        },
        vision: {
            tag: "فلسفتنا",
            title: "الاصطناع الذكي: ما وراء الذكاء الاصطناعي.",
            desc1: "في Afrikyia، «الاصطناع الذكي» هو تحول جوهري في الإدراك. لأن الذكاء الحقيقي ليس مجرد نتاج للخوارزميات، بل هو فعل متعمد من الصياغة الثقافية.",
            desc2: "إنه الاستخدام المتعمد للقوى التقنية والإبداعية لإعادة صياغة واقعنا الرقمي من خلال عدسة الهوية والتراث والفعل الإنساني لتحويل التكنولوجيا إلى وعاء ثقافي."
        },
        services: {
            tag: "خبراتنا",
            title: "حلول لثقافة رقمية",
            list: [
                { title: "إنتاج وتطوير المحتوى الثقافي", desc: "" },
                { title: "توثيق الذاكرة والهوية", desc: "" },
                { title: "حلول الذكاء الاصطناعي والمنصات", desc: "" },
                { title: "المكتبات السمعية والبصرية", desc: "" },
                { title: "الاستشارات الاستراتيجية", desc: "" },
                { title: "المعارض والفعاليات", desc: "" },
                { title: "النشر الرقمي والورقي", desc: "" },
                { title: "التكوين والتدريب الإبداعي", desc: "" },
                { title: "إدارة المشاريع", desc: "" }
            ]
        },
        achievements: {
            tag: "إنجازاتنا",
            title: "المشاريع والأنشطة المنجزة",
            filters: {
                all: "الكل",
                websites: "مواقع ويب",
                activities: "أنشطة",
                works: "أعمال إبداعية"
            },
            list: [
                {
                    title: "بوابة TDM الرقمية",
                    category: "websites",
                    categoryLabel: "موقع ويب",
                    desc: "بوابة رقمية شاملة وعالية الأداء لخدمات الاتصالات والإعلام، تسهل التفاعل العمومي والإداري.",
                    link: "https://tdm.mr"
                },
                {
                    title: "خريطة التراث الثقافي",
                    category: "websites",
                    categoryLabel: "منصة رقمية",
                    desc: "منصة خرائطية رقمية تفاعلية لتوثيق المواقع التاريخية والتراث الثقافي باستخدام تقنيات نظم المعلومات الجغرافية المتقدمة.",
                    link: "https://culturalmap.org"
                },
                {
                    title: "بوابة الموسيقى السعودية",
                    category: "websites",
                    categoryLabel: "بوابة رقمية",
                    desc: "بوابة ثقافية حديثة وذات تباين عالٍ تستعرض التراث الموسيقي السعودي وتربط بين محترفي هذا القطاع.",
                    link: "https://saudimusic.gov.sa"
                },
                {
                    title: "دفتر وكيل بنكيلي",
                    category: "works",
                    categoryLabel: "تطبيق ويب",
                    desc: "دفتر وكيل رقمي آمن للعمل دون اتصال بالإنترنت، يتتبع المعاملات المالية، وفئات العمولات، والأرصدة اليومية.",
                    link: "#"
                },
                {
                    title: "نظام إدارة لا مدينا",
                    category: "works",
                    categoryLabel: "نظام تشغيل",
                    desc: "نظام إدارة الفنادق والضيافة متطور مصمم لعمليات تشغيل يومية سلسة وإدارة الحجوزات بدقة وكفاءة.",
                    link: "#"
                },
                {
                    title: "الفن الرقمي والسيادة الثقافية",
                    category: "activities",
                    categoryLabel: "نشاط",
                    desc: "مبادرة رقمية تستعرض الأعمال الإبداعية الحديثة وتدعم المبدعين المحليين لفرض سيادتهم في الاقتصاد الإبداعي العالمي.",
                    link: "#"
                }
            ]
        },
        impact: {
            tag: "التأثير الاستراتيجي",
            title: "صياغة السردية العالمية",
            desc: "تعمل Afrikyia عند تقاطع الاقتصاد الإبداعي والسيادة الرقمية، لبناء نظام بيئي مستدام للتعبير الثقافي.",
            list: [
                { label: "ثقافي", value: "تجسير التراث والمستقبل" },
                { label: "اقتصادي", value: "التحول الإبداعي" },
                { label: "رقمي", value: "الاصطناع الذكي" },
                { label: "عالمي", value: "هوية عابرة للحدود" }
            ]
        },
        footer: {
            motto: "أفق رقمي للسيادة الإبداعية.",
            rights: "© 2026 AFRIKYia – جميع الحقوق محفوظة",
            privacy: "سياسة الخصوصية",
            terms: "الشروط القانونية"
        },
        admin: {
            menu: {
                dashboard: "لوحة التحكم",
                clients: "العملاء",
                offers: "العروض",
                invoices: "الفواتير",
                deliveryNotes: "سندات التسليم",
                files: "الملفات",
                achievements: "الإنجازات",
                users: "المستخدمون",
                settings: "الإعدادات",
                logout: "تسجيل الخروج",
                backToSite: "العودة للموقع"
            },
            common: {
                search: "بحث...",
                add: "إضافة",
                save: "حفظ",
                cancel: "إلغاء",
                delete: "حذف",
                edit: "تعديل",
                actions: "إجراءات",
                status: "الحالة",
                date: "التاريخ",
                amount: "المبلغ",
                back: "العودة",
                soon: "قريباً",
                preview: "معاينة",
                convertToInvoice: "تحويل إلى فاتورة",
                draft: "مسودة",
                sent: "مُرسَل",
                accepted: "مقبول",
                rejected: "مرفوض",
                paid: "مدفوعة",
                unpaid: "غير مدفوعة",
                overdue: "متأخرة",
                signed: "مُوَقَّع",
                active: "نشط",
                inactive: "غير نشط",
                reference: "المرجع"
            },
            dashboard: {
                title: "لوحة التحكم",
                subtitle: "نظرة عامة على أعمال وكالة Afrikyia",
                createOffer: "إنشاء عرض جديد",
                recentActivity: "آخر النشاطات",
                noActivity: "لا توجد نشاطات حديثة لعرضها.",
                statClients: "العملاء",
                statOffers: "العروض المفتوحة",
                statInvoices: "إجمالي الفواتير",
                statAchievements: "المشاريع والإنجازات"
            },
            clients: {
                title: "العملاء",
                addClient: "إضافة عميل",
                noClients: "لا يوجد عملاء حالياً.",
                noClientsSub: "سيتم عرض جميع العملاء هنا فور إضافتهم.",
                newTitle: "إضافة عميل جديد",
                newSub: "قم بإدخال بيانات العميل لإضافته للنظام.",
                clientName: "اسم العميل (ممثل الشركة)",
                clientNamePlaceholder: "مثال: أحمد محمود",
                companyName: "اسم الشركة / المؤسسة",
                companyNamePlaceholder: "مثال: TDM",
                email: "البريد الإلكتروني",
                emailPlaceholder: "email@example.com",
                phone: "رقم الهاتف",
                phonePlaceholder: "+222 40 00 00 00",
                clientStatus: "حالة العميل",
                saveClient: "حفظ بيانات العميل",
                saving: "جاري الحفظ..."
            },
            offers: {
                title: "العروض",
                addOffer: "عرض جديد",
                noOffers: "لا يوجد عروض حالياً.",
                noOffersSub: "سيتم عرض جميع العروض هنا فور إضافتها.",
                newTitle: "إضافة عرض جديد",
                newSub: "قم بتعبئة بيانات العرض لإضافته للنظام.",
                clientName: "اسم العميل",
                clientNamePlaceholder: "مثال: شركة النور",
                refPlaceholder: "Q-2026-...",
                amountPlaceholder: "مثال: 50000",
                description: "الوصف التفصيلي",
                descriptionPlaceholder: "تفاصيل العرض والمشروع...",
                saveOffer: "حفظ العرض",
                saving: "جاري الحفظ..."
            },
            invoices: {
                title: "الفواتير",
                addInvoice: "فاتورة جديدة",
                noInvoices: "لا توجد فواتير حالياً.",
                noInvoicesSub: "سيتم عرض جميع الفواتير هنا فور إضافتها.",
                newTitle: "إضافة فاتورة جديدة",
                newSub: "قم بتعبئة بيانات الفاتورة لإضافتها للنظام.",
                saveInvoice: "حفظ الفاتورة",
                saving: "جاري الحفظ...",
                confirmPayment: "تأكيد الدفع",
                downloadPDF: "تحميل PDF"
            },
            deliveryNotes: {
                title: "سندات التسليم",
                addNote: "سند تسليم جديد",
                noNotes: "لا توجد سندات تسليم حالياً.",
                noNotesSub: "سيتم عرض جميع سندات التسليم هنا فور إضافتها.",
                newTitle: "إضافة سند تسليم جديد",
                newSub: "قم بتعبئة بيانات سند التسليم لإضافته.",
                notesAndDetails: "الملاحظات والتفاصيل",
                notesPlaceholder: "تفاصيل المنتجات أو الخدمات المسلمة...",
                saveNote: "حفظ سند التسليم",
                saving: "جاري الحفظ..."
            },
            files: {
                title: "الملفات",
                addFile: "رفع ملف جديد",
                noFiles: "لا يوجد ملفات مرفوعة حالياً.",
                noFilesSub: "سيتم عرض جميع المستندات والملفات المرفوعة هنا.",
                newTitle: "رفع ملف جديد",
                newSub: "قم بتحديد الملف وإدخال تفاصيله لرفعه.",
                chooseFile: "اختر الملف",
                uploadHintTitle: "اضغط هنا لاختيار ملف أو اسحب الملف وأفلته هنا",
                uploadHintSub: "يدعم PDF, DOCX, صور (الحد الأقصى 10MB)",
                fileName: "اسم الملف",
                fileNamePlaceholder: "مثال: عقد شراكة - TDM",
                category: "التصنيف",
                catDocument: "مستندات وعقود",
                catInvoice: "مرفقات فواتير",
                catDesign: "تصاميم وملحقات",
                catOther: "أخرى",
                description: "الوصف (اختياري)",
                descriptionPlaceholder: "نبذة بسيطة عن الملف...",
                saveFile: "رفع الملف",
                saving: "جاري الرفع..."
            },
            users: {
                title: "المستخدمون",
                addUser: "إضافة مستخدم",
                editPermissions: "تعديل الصلاحيات",
                adminRole: "مدير النظام"
            },
            settings: {
                title: "الإعدادات",
                saveChanges: "حفظ التغييرات",
                accountSettings: "إعدادات الحساب",
                username: "اسم المستخدم",
                newPassword: "كلمة المرور الجديدة",
                passwordHint: "ترك الحقل فارغاً للاحتفاظ بكلمة المرور الحالية",
                systemPrefs: "تفضيلات النظام",
                notifications: "الإشعارات",
                notificationsHint: "تلقي إشعارات عند إضافة عروض جديدة",
                darkMode: "الوضع الليلي",
                darkModeHint: "تفعيل الوضع الليلي بشكل دائم"
            },
            auth: {
                loginTitle: "لوحة التحكم في الإنجازات",
                loginSub: "Admin Portal",
                enterCode: "أدخل رمز التحقق (رمز الإدارة)",
                passwordPlaceholder: "رمز التحقق (مثال: afrikyia2026)",
                incorrectPassword: "كلمة المرور غير صحيحة",
                loginButton: "دخول لوحة الإدارة"
            },
            achievements: {
                title: "لوحة إدارة الإنجازات",
                subtitle: "تعديل وإضافة المواقع والأعمال المنجزة والأنشطة",
                totalAchievements: "إجمالي الإنجازات",
                websites: "مواقع إلكترونية",
                activities: "أنشطة وفعاليات",
                works: "تطبيقات وأعمال",
                searchPlaceholder: "ابحث في العناوين والوصف...",
                filterAll: "الكل",
                filterWebsites: "مواقع",
                filterActivities: "أنشطة",
                filterWorks: "أعمال",
                addNew: "إضافة إنجاز جديد",
                noMatches: "لم يتم العثور على أي أعمال أو أنشطة مطابقة.",
                nameCol: "اسم الإنجاز",
                categoryCol: "التصنيف",
                linkCol: "الرابط",
                actionsCol: "التحكم",
                noLink: "لا يوجد رابط"
            }
        }
    }
};
