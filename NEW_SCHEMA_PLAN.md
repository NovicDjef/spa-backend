# 🗄️ Plan du Nouveau Schéma de Base de Données

## Nouveaux Modèles à Créer

### 1. ServiceCategory (Catégories de services)
```prisma
model ServiceCategory {
  id          String    @id @default(cuid())
  name        String    @unique  // "MASSOTHERAPIE", "ESTHETIQUE", "THERMAL", "GYM"
  description String?
  isActive    Boolean   @default(true)
  services    Service[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### 2. Service (Services individuels)
```prisma
model Service {
  id              String          @id @default(cuid())
  name            String          // "Massage Découverte"
  description     String?         @db.Text
  duration        Int             // Durée en minutes
  price           Decimal         @db.Decimal(10, 2)  // Prix AVANT taxes
  categoryId      String
  category        ServiceCategory @relation(fields: [categoryId], references: [id])
  isActive        Boolean         @default(true)

  // Relations
  bookings        Booking[]
  packageServices PackageService[]
  promotions      ServicePromotion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([categoryId])
  @@index([isActive])
}
```

### 3. Package (Forfaits/Combinaisons)
```prisma
model Package {
  id              String           @id @default(cuid())
  name            String           // "Le forfait Basque"
  description     String?          @db.Text
  price           Decimal          @db.Decimal(10, 2)
  originalPrice   Decimal?         @db.Decimal(10, 2)  // Prix sans réduction
  discount        Decimal?         @db.Decimal(5, 2)   // % de réduction
  variant         String?          // "Petite", "Grande", "Extra nuitée"
  isActive        Boolean          @default(true)

  // Services inclus
  services        PackageService[]
  bookings        Booking[]
  promotions      PackagePromotion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive])
}
```

### 4. PackageService (Services inclus dans un forfait)
```prisma
model PackageService {
  id        String  @id @default(cuid())
  packageId String
  package   Package @relation(fields: [packageId], references: [id], onDelete: Cascade)
  serviceId String
  service   Service @relation(fields: [serviceId], references: [id])
  quantity  Int     @default(1)
  isOptional Boolean @default(false)  // Pour les options comme "+19$ Neuro Spa"
  extraCost  Decimal? @db.Decimal(10, 2)  // Coût supplémentaire si optionnel

  @@index([packageId])
  @@index([serviceId])
}
```

### 5. GiftCard (Certificats cadeaux)
```prisma
model GiftCard {
  id            String   @id @default(cuid())
  code          String   @unique
  amount        Decimal  @db.Decimal(10, 2)
  balance       Decimal  @db.Decimal(10, 2)
  purchasedBy   String?  // Email ou nom de l'acheteur
  recipientName String?
  recipientEmail String?
  message       String?  @db.Text

  // Statut
  isActive      Boolean  @default(true)
  expiresAt     DateTime?

  // Paiement
  paymentId     String?  @unique
  payment       Payment? @relation(fields: [paymentId], references: [id])

  // Utilisation
  usedInBookings Booking[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([code])
  @@index([isActive])
}
```

### 6. GymMembership (Abonnements gym)
```prisma
model GymMembership {
  id          String   @id @default(cuid())
  type        String   // "1_DAY", "1_MONTH", "3_MONTHS", "6_MONTHS", "1_YEAR"
  price       Decimal  @db.Decimal(10, 2)
  duration    Int      // Durée en jours
  description String?
  isActive    Boolean  @default(true)

  subscriptions GymSubscription[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([type])
  @@index([isActive])
}
```

### 7. GymSubscription (Abonnements actifs)
```prisma
model GymSubscription {
  id           String        @id @default(cuid())
  membershipId String
  membership   GymMembership @relation(fields: [membershipId], references: [id])

  // Informations client
  clientEmail  String
  clientName   String
  clientPhone  String

  // Dates
  startDate    DateTime
  endDate      DateTime
  isActive     Boolean       @default(true)

  // Paiement
  paymentId    String        @unique
  payment      Payment       @relation(fields: [paymentId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([membershipId])
  @@index([clientEmail])
  @@index([isActive])
}
```

### 8. Product (Produits Biosthetique)
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  category    String?  // "SOIN_VISAGE", "SOIN_CORPS", etc.
  imageUrl    String?
  isActive    Boolean  @default(true)

  // Relations
  orderItems  OrderItem[]
  promotions  ProductPromotion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
  @@index([isActive])
}
```

### 9. Order (Commandes de produits)
```prisma
model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique

  // Client
  clientEmail String
  clientName  String
  clientPhone String

  // Livraison
  shippingAddress String?  @db.Text

  // Montants
  subtotal    Decimal     @db.Decimal(10, 2)
  taxTPS      Decimal     @db.Decimal(10, 2)
  taxTVQ      Decimal     @db.Decimal(10, 2)
  total       Decimal     @db.Decimal(10, 2)

  // Statut
  status      String      // "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"

  // Paiement
  paymentId   String      @unique
  payment     Payment     @relation(fields: [paymentId], references: [id])

  // Items
  items       OrderItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderNumber])
  @@index([clientEmail])
  @@index([status])
}
```

### 10. OrderItem (Articles d'une commande)
```prisma
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2)  // Prix unitaire au moment de l'achat

  @@index([orderId])
  @@index([productId])
}
```

### 11. Booking (Réservations)
```prisma
model Booking {
  id              String   @id @default(cuid())
  bookingNumber   String   @unique

  // Type de réservation
  type            String   // "SERVICE", "PACKAGE", "THERMAL"

  // Service ou Package
  serviceId       String?
  service         Service? @relation(fields: [serviceId], references: [id])
  packageId       String?
  package         Package? @relation(fields: [packageId], references: [id])

  // Client
  clientEmail     String
  clientName      String
  clientPhone     String
  specialNotes    String?  @db.Text

  // Date et heure
  bookingDate     DateTime
  startTime       String   // "09:00"
  endTime         String   // "10:30"

  // Professionnel assigné
  professionalId  String?
  professional    User?    @relation(fields: [professionalId], references: [id])

  // Montants
  subtotal        Decimal  @db.Decimal(10, 2)
  taxTPS          Decimal  @db.Decimal(10, 2)
  taxTVQ          Decimal  @db.Decimal(10, 2)
  total           Decimal  @db.Decimal(10, 2)

  // Carte cadeau utilisée
  giftCardId      String?
  giftCard        GiftCard? @relation(fields: [giftCardId], references: [id])
  giftCardAmount  Decimal?  @db.Decimal(10, 2)

  // Statut
  status          String   // "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"

  // Paiement
  paymentId       String   @unique
  payment         Payment  @relation(fields: [paymentId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([bookingNumber])
  @@index([clientEmail])
  @@index([bookingDate])
  @@index([professionalId])
  @@index([status])
}
```

### 12. Availability (Disponibilités des techniciens)
```prisma
model Availability {
  id             String   @id @default(cuid())
  professionalId String
  professional   User     @relation("ProfessionalAvailability", fields: [professionalId], references: [id], onDelete: Cascade)

  // Date et heures
  date           DateTime @db.Date
  startTime      String   // "09:00"
  endTime        String   // "17:00"

  // Statut
  isAvailable    Boolean  @default(true)
  reason         String?  // "VACATION", "SICK", "BOOKED", etc.

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([professionalId])
  @@index([date])
  @@unique([professionalId, date, startTime])
}
```

### 13. Payment (Paiements Stripe)
```prisma
model Payment {
  id                String    @id @default(cuid())

  // Stripe
  stripePaymentId   String    @unique
  stripeCustomerId  String?

  // Montants
  amount            Decimal   @db.Decimal(10, 2)
  currency          String    @default("CAD")

  // Statut
  status            String    // "PENDING", "SUCCEEDED", "FAILED", "REFUNDED"

  // Métadonnées
  paymentMethod     String?   // "card", "apple_pay", etc.
  receiptUrl        String?
  receiptPdfUrl     String?   // URL du PDF généré

  // Relations (une seule sera remplie)
  booking           Booking?
  order             Order?
  giftCard          GiftCard?
  gymSubscription   GymSubscription?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([stripePaymentId])
  @@index([status])
}
```

### 14. Promotion (Promotions générales)
```prisma
model Promotion {
  id          String    @id @default(cuid())
  name        String
  description String?   @db.Text
  code        String?   @unique  // Code promo optionnel

  // Type de réduction
  discountType String   // "PERCENTAGE", "FIXED_AMOUNT"
  discountValue Decimal @db.Decimal(10, 2)

  // Dates
  startDate   DateTime
  endDate     DateTime

  // Statut
  isActive    Boolean   @default(true)

  // Relations
  services    ServicePromotion[]
  packages    PackagePromotion[]
  products    ProductPromotion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([code])
  @@index([isActive])
}
```

### 15. ServicePromotion, PackagePromotion, ProductPromotion
```prisma
model ServicePromotion {
  id          String     @id @default(cuid())
  promotionId String
  promotion   Promotion  @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  serviceId   String
  service     Service    @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([promotionId, serviceId])
  @@index([promotionId])
  @@index([serviceId])
}

model PackagePromotion {
  id          String     @id @default(cuid())
  promotionId String
  promotion   Promotion  @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  packageId   String
  package     Package    @relation(fields: [packageId], references: [id], onDelete: Cascade)

  @@unique([promotionId, packageId])
  @@index([promotionId])
  @@index([packageId])
}

model ProductPromotion {
  id          String     @id @default(cuid())
  promotionId String
  promotion   Promotion  @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  productId   String
  product     Product    @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([promotionId, productId])
  @@index([promotionId])
  @@index([productId])
}
```

---

## Modifications au Modèle User Existant

Ajouter ces relations au modèle User:
```prisma
model User {
  // ... champs existants ...

  // Nouvelles relations
  bookingsAsProfessional Booking[] @relation
  availabilities         Availability[] @relation("ProfessionalAvailability")
}
```

---

## 📊 Résumé

**Nouveaux modèles:** 15+
**Relations:** ~30
**Index:** ~50

Ce schéma permet:
✅ Gestion complète des services et forfaits
✅ Système de réservation en ligne
✅ Gestion des disponibilités en temps réel
✅ Paiements Stripe
✅ Cartes cadeaux
✅ Abonnements gym
✅ Produits e-commerce
✅ Promotions flexibles
✅ Génération de reçus PDF
