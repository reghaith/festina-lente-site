import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('694f838c0019ec9c5295')
  .setKey('standard_ba77a9cad00198321c8c5c14f5e7732bc31068633cc0bc3d2524475c6e03635b4ee70a9478484a6349b8981b5be94424c82fe0163107cab1211ac8520a41a8c273243e53b5e82612a77acf4f0286c3675c5286c5aa01924652f2515ddc88460cd0294d2b5a31b8e0895093b72c2da27c6e70450e1e0261e0afa535d10e4a9830');

const databases = new Databases(client);

async function setupCollection() {
  try {
    const collection = await databases.createCollection(
      'earnflow',
      'users',
      'Users Collection'
    );
    console.log('Collection created:', collection.$id);

    await databases.createStringAttribute(
      'earnflow',
      'users',
      'email',
      255,
      true
    );
    console.log('Email attribute created');

    await databases.createStringAttribute(
      'earnflow',
      'users',
      'name',
      255,
      false
    );
    console.log('Name attribute created');

    console.log('Setup complete!');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('Collection or attributes already exist');
    } else {
      console.error('Error:', error.message);
    }
  }
}

setupCollection();
