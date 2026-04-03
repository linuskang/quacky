const { execSync } = require('child_process');

async function main() {
  console.log('Generating Prisma Client...');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma Client generated successfully');
  } catch (error) {
    console.error('Failed to generate Prisma Client:', error.message);
    process.exit(1);
  }

  console.log('\nRunning database migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Failed to run migrations:', error.message);
    process.exit(1);
  }

  console.log('\nDatabase setup complete!');
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});