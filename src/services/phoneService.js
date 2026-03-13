import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;

const uri = MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 2,
});

let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log("Conectado a MongoDB !!!");
  }
  return client.db("smartphone_specs");
}

export async function getSmartphones() {
  try {
    const database = await connectDB();
    const phones = database.collection("smartphones");

    const smartphoneList = await phones.find({}, {
      projection: {
        brand: 1,
        model_name: 1,
        price: 1,
        release_date: 1,
        'screen.size_inches': 1,
        'screen.type': 1,
        'cameras.rear': 1,
        'storage.internal_gb': 1,
        'os.name': 1,
        'os.version': 1,
        'highlight_features': 1
      }
    }).toArray();

    console.log(`Se encontraron ${smartphoneList.length} smartphones en la colección.`);
    return smartphoneList;
  } catch (error) {
    console.error("Error al obtener smartphones:", error);
    return [];
  }
  // NO cerrar la conexión aquí
}

export async function getSmartphoneById(id) {
  try {
    const database = await connectDB();
    const phones = database.collection("smartphones");

    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const smartphone = await phones.findOne({ _id: objectId });

    if (smartphone) {
      console.log("Smartphone encontrado:", smartphone.model_name);
      return smartphone;
    } else {
      console.log("No se encontró ningún smartphone con ese ID.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el smartphone por ID:", error);
    return null;
  }
}

export async function getSmartphoneBySlug(slug) {
  try {
    const database = await connectDB();
    const phones = database.collection("smartphones");

    const smartphone = await phones.findOne({
      model_name: slug
    });

    if (smartphone) {
      console.log("Smartphone encontrado por Slug:", smartphone.model_name);
      console.log(smartphone);
      return smartphone;
    } else {
      console.log("No se encontró ningún smartphone con el slug: " + slug);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el smartphone por slug:", error);
    return null;
  }
}

// Cerrar la conexión cuando el proceso termine
process.on('SIGINT', async () => {
  await client.close();
  console.log("Conexión a MongoDB cerrada");
  process.exit(0);
});