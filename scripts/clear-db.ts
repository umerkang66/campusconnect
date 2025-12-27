import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

async function clearDatabase() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // Get all collections
        const collections = await db.listCollections().toArray();

        console.log(`\n📦 Found ${collections.length} collections:`);
        collections.forEach(c => console.log(`   - ${c.name}`));

        console.log('\n🗑️  Deleting all data...\n');

        // Delete all documents from each collection
        for (const collection of collections) {
            const result = await db.collection(collection.name).deleteMany({});
            console.log(`   ✓ ${collection.name}: deleted ${result.deletedCount} documents`);
        }

        console.log('\n✅ Database cleared successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

clearDatabase();

// npx tsx scripts/clear-db.ts
