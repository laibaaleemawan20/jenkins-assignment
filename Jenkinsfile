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
        NEXT_PUBLIC_BASE_URL = "http://127.0.0.1:3000"
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
                pkill -f "next start" || true
                pkill -f "next dev" || true

                npx next start -H 0.0.0.0 -p 3000 > app.log 2>&1 &
                APP_PID=$!

                echo "Waiting for app to start..."
                for i in $(seq 1 60); do
                    if curl -s http://127.0.0.1:3000 > /dev/null; then
                        echo "App is running"
                        break
                    fi
                    sleep 2
                done

                curl -s http://127.0.0.1:3000 > /dev/null || (cat app.log && exit 1)

                BASE_URL=http://localhost:3000 npm test

                kill $APP_PID || true
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh 'echo "Deploying application..."'
            }
        }
    }

    post {
        always {
            emailext(
                to: 'laibaaleemawan@gmail.com',
                subject: "Jenkins Assignment Build ${env.BUILD_NUMBER}: ${currentBuild.currentResult}",
                body: "Project: ${env.JOB_NAME}\nBuild Number: ${env.BUILD_NUMBER}\nStatus: ${currentBuild.currentResult}\nBuild URL: ${env.BUILD_URL}\n\nSelenium tests were executed in the Jenkins pipeline."
            )
        }
    }
}
