import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Créer des rôles
  const roles = ['Admin', 'User', 'Guest'];
  const roleRecords = await Promise.all(roles.map(role => 
    prisma.role.create({ data: { name: role } })
  ));

  // Créer des administrateurs
  const adminRecords = [];
  for (let i = 0; i < 5; i++) {
    const admin = await prisma.admin.create({
      data: {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phone: faker.phone.number(),
        image: faker.image.avatar(),
      },
    });
    adminRecords.push(admin);

    // Associer des rôles aux administrateurs
    await prisma.userRole.create({
      data: {
        adminId: admin.id,
        roleId: roleRecords[0].id, // Rôle Admin
      },
    });
  }

  // Créer des villes
  const villeRecords = [];
  for (let i = 0; i < 10; i++) {
    const ville = await prisma.ville.create({
      data: {
        name: faker.address.city(),
        longitude: parseFloat(faker.address.longitude()),
        latitude: parseFloat(faker.address.latitude()),
      },
    });
    villeRecords.push(ville);
  }

  // Créer des restaurants
  const restaurantRecords = [];
  for (let i = 0; i < 20; i++) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: faker.company.name(),
        phone: faker.phone.number(),
        adresse: faker.address.streetAddress(),
        image: faker.image.food(),
        description: faker.lorem.paragraph(),
        ratings: faker.datatype.float({ min: 0, max: 5, precision: 0.1 }),
        latitude: parseFloat(faker.address.latitude()),
        longitude: parseFloat(faker.address.longitude()),
        admin: { connect: { id: faker.helpers.arrayElement(adminRecords).id } },
        ville: { connect: { id: faker.helpers.arrayElement(villeRecords).id } },
      },
    });
    restaurantRecords.push(restaurant);

    // Créer des heures d'ouverture pour chaque restaurant
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    for (const jour of jours) {
      await prisma.heuresOuverture.create({
        data: {
          jour,
          heures: `${faker.datatype.number({ min: 7, max: 11 })}h - ${faker.datatype.number({ min: 18, max: 23 })}h`,
          restaurantId: restaurant.id,
        },
      });
    }
  }

  // Créer des utilisateurs
  const userRecords = [];
  for (let i = 0; i < 50; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.userName(),
        phone: faker.phone.number(),
        image: faker.image.avatar(),
      },
    });
    userRecords.push(user);

    // Créer un OTP pour chaque utilisateur
    await prisma.oTP.create({
      data: {
        phone: user.phone,
        code: faker.datatype.number({ min: 1000, max: 9999 }),
        verificationSid: faker.datatype.uuid(),
        status: faker.helpers.arrayElement(['pending', 'verified']),
        userId: user.id,
      },
    });
  }

  // Créer des menus, catégories et plats
  for (const restaurant of restaurantRecords) {
    const menu = await prisma.menu.create({
      data: {
        name: faker.commerce.department(),
        restaurantId: restaurant.id,
      },
    });

    for (let i = 0; i < 5; i++) {
      const categorie = await prisma.categorie.create({
        data: {
          name: faker.commerce.productName(),
          image: faker.image.food(),
          description: faker.lorem.sentence(),
          menuId: menu.id,
        },
      });

      for (let j = 0; j < 10; j++) {
        await prisma.plats.create({
          data: {
            name: faker.commerce.productName(),
            image: faker.image.food(),
            description: faker.lorem.sentence(),
            prix: parseFloat(faker.commerce.price()),
            quantity: faker.datatype.number({ min: 1, max: 100 }),
            ratings: faker.datatype.float({ min: 0, max: 5, precision: 0.1 }),
            categorieId: categorie.id,
          },
        });
      }
    }
  }

  // Créer des commandes et paiements
  for (const user of userRecords) {
    for (let i = 0; i < faker.datatype.number({ min: 1, max: 5 }); i++) {
      const plat = await prisma.plats.findFirst({ orderBy: { id: 'desc' } });
      const commande = await prisma.commande.create({
        data: {
          quantity: faker.datatype.number({ min: 1, max: 5 }),
          prix: parseFloat(faker.commerce.price()),
          recommandation: faker.lorem.sentence(),
          position: faker.address.streetAddress(),
          status: faker.helpers.arrayElement(['EN_COURS', 'PAYEE', 'LIVREE', 'ANNULEE']),
          userId: user.id,
          platsId: plat?.id,
        },
      });

      // Créer un paiement pour chaque commande
      await prisma.payement.create({
        data: {
          amount: commande.prix,
          mode_payement: faker.helpers.arrayElement(['MOBILE_MONEY', 'CARTE_BANCAIRE', 'A_LA_LIVRAISON']),
          currency: 'XAF',
          status: faker.helpers.arrayElement(['EN_ATTENTE', 'COMPLETE', 'ECHOUE', 'REMBOURSE']),
          reference: faker.datatype.uuid(),
          phone: user.phone,
          email: faker.internet.email(),
          authorization_url: faker.internet.url(),
          userId: user.id,
          commandeId: commande.id,
        },
      });
    }
  }

  // Créer des réservations
  for (const user of userRecords) {
    for (let i = 0; i < faker.datatype.number({ min: 0, max: 3 }); i++) {
      const restaurant = faker.helpers.arrayElement(restaurantRecords);
      await prisma.reservation.create({
        data: {
          numero_table: faker.datatype.number({ min: 1, max: 50 }).toString(),
          nombre_personne: faker.datatype.number({ min: 1, max: 10 }),
          prix_reservation: parseFloat(faker.commerce.price()),
          userId: user.id,
          restaurantId: restaurant.id,
        },
      });
    }
  }

  // Créer des colis
  for (let i = 0; i < 30; i++) {
    await prisma.colis.create({
      data: {
        description: faker.lorem.sentence(),
        poids: faker.datatype.float({ min: 0.1, max: 50, precision: 0.1 }),
        dimensions: `${faker.datatype.number({ min: 10, max: 100 })}x${faker.datatype.number({ min: 10, max: 100 })}x${faker.datatype.number({ min: 10, max: 100 })}`,
        adresseDepart: faker.address.streetAddress(),
        adresseArrivee: faker.address.streetAddress(),
        userId: faker.helpers.arrayElement(userRecords).id,
      },
    });
  }

  // Créer des services de livraison
  const serviceLivraisonRecords = [];
  for (let i = 0; i < 5; i++) {
    const serviceLivraison = await prisma.serviceLivraison.create({
      data: {
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        frais: parseFloat(faker.commerce.price()),
      },
    });
    serviceLivraisonRecords.push(serviceLivraison);
  }

  // Créer des livraisons
  for (let i = 0; i < 50; i++) {
    await prisma.livraison.create({
      data: {
        type: faker.helpers.arrayElement(['COMMANDE', 'COLIS']),
        statut: faker.helpers.arrayElement(['LIVREE', 'ANNULEE', 'NON_LIVRE']),
        adresseDepart: faker.address.streetAddress(),
        adresseArrivee: faker.address.streetAddress(),
        serviceLivraisonId: faker.helpers.arrayElement(serviceLivraisonRecords).id,
      },
    });
  }

  console.log('Données fictives générées avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  // npx prisma db seed