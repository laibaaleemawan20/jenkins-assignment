pipeline {
    agent any

    environment {
        NODE_OPTIONS = "--max-old-space-size=2048"
        STRIPE_SECRET_KEY = "test_key"
        NEXT_PUBLIC_SANITY_DATASET = "production"
        NEXT_PUBLIC_SANITY_PROJECT_ID = "dummyproject"
        NEXT_PUBLIC_SANITY_API_VERSION = "2024-01-01"
        SANITY_API_TOKEN = "dummy_token"
        SANITY_API_READ_TOKEN = "dummy_read_token"
        NEXT_PUBLIC_BASE_URL = "http://16.16.172.60:3000"
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_ZHVtbXkta2V5JA"
        CLERK_SECRET_KEY = "sk_test_dummy"
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm install --legacy-peer-deps'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh '''
                pkill -f "next dev" || true
                npm run dev -- --hostname 0.0.0.0 > app.log 2>&1 &
                sleep 25
                BASE_URL=http://127.0.0.1:3000 npm test || BASE_URL=http://16.16.172.60:3000 npm test
                pkill -f "next dev" || true
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh 'echo "Deploying application..."'
            }
        }
    }
}
