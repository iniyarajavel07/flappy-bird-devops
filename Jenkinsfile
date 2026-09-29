node {
    def APP_NAME           = 'flappy-bird'
    def IMAGE_TAG          = 'jenkins-build'
    
    // Feature flags for downstream cloud deployment stages (Default: false for current local validation phase)
    def ENABLE_DOCKER_PUSH  = false
    def ENABLE_TERRAFORM    = false
    def ENABLE_ANSIBLE      = false
    def ENABLE_KUBERNETES   = false

    try {
        timeout(time: 1, unit: 'HOURS') {

            stage('Stage 1 — Checkout') {
                echo "===> Checking out source code from Git..."
                checkout scm
            }

            stage('Stage 2 — Project Validation') {
                echo "===> Validating required project configuration files..."
                def requiredFiles = [
                    'app/index.html',
                    'app/style.css',
                    'app/game.js',
                    'docker/Dockerfile',
                    'docker/nginx.conf',
                    'k8s/deployment.yaml',
                    'tests/package.json',
                    'tests/game.test.js'
                ]
                for (file in requiredFiles) {
                    if (!fileExists(file)) {
                        error("CRITICAL: Required project file missing: ${file}")
                    } else {
                        echo "✅ Verified: ${file}"
                    }
                }
            }

            stage('Stage 3 — Automated Tests') {
                echo "===> Running automated JavaScript unit tests..."
                dir('tests') {
                    if (isUnix()) {
                        sh 'npm install && npm test'
                    } else {
                        bat '''
                            @echo off
                            where npm >nul 2>&1
                            if %errorlevel% equ 0 (
                                npm install && npm test
                            ) else if exist "C:\\Program Files\\nodejs\\npm.cmd" (
                                set "PATH=C:\\Program Files\\nodejs;%PATH%"
                                npm install && npm test
                            ) else (
                                echo CRITICAL: npm/node is not found in PATH or standard Node.js path.
                                echo Please install Node.js from https://nodejs.org/ or configure the NodeJS Jenkins plugin.
                                exit /b 1
                            )
                        '''
                    }
                }
            }

            stage('Stage 4 — Docker Build') {
                echo "===> Building Docker image: ${APP_NAME}:${IMAGE_TAG}"
                if (isUnix()) {
                    sh "docker build -f docker/Dockerfile -t ${APP_NAME}:${IMAGE_TAG} -t ${APP_NAME}:latest ."
                } else {
                    bat '''
                        @echo off
                        where docker >nul 2>&1
                        if %errorlevel% equ 0 (
                            docker build -f docker/Dockerfile -t %APP_NAME%:%IMAGE_TAG% -t %APP_NAME%:latest .
                        ) else if exist "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" (
                            set "PATH=C:\\Program Files\\Docker\\Docker\\resources\\bin;%PATH%"
                            docker build -f docker/Dockerfile -t %APP_NAME%:%IMAGE_TAG% -t %APP_NAME%:latest .
                        ) else (
                            echo CRITICAL: Docker CLI is not found in PATH or standard Docker Desktop path.
                            exit /b 1
                        )
                    '''
                }
            }

            stage('Stage 5 — Image Verification') {
                echo "===> Verifying built Docker image metadata..."
                if (isUnix()) {
                    sh "docker image inspect ${APP_NAME}:${IMAGE_TAG}"
                } else {
                    bat '''
                        @echo off
                        where docker >nul 2>&1
                        if %errorlevel% equ 0 (
                            docker image inspect %APP_NAME%:%IMAGE_TAG%
                        ) else if exist "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" (
                            set "PATH=C:\\Program Files\\Docker\\Docker\\resources\\bin;%PATH%"
                            docker image inspect %APP_NAME%:%IMAGE_TAG%
                        ) else (
                            echo CRITICAL: Docker CLI not found.
                            exit /b 1
                        )
                    '''
                }
            }

            stage('Stage 6 — Security Scan') {
                echo "===> Checking for Trivy container security scanner..."
                if (isUnix()) {
                    sh '''
                        if command -v trivy >/dev/null 2>&1; then
                            trivy image --severity HIGH,CRITICAL ${APP_NAME}:${IMAGE_TAG}
                        else
                            echo "WARNING: Trivy scanner not installed on Linux agent. Skipping security scan stage."
                        fi
                    '''
                } else {
                    bat '''
                        @echo off
                        where trivy >nul 2>&1
                        if %errorlevel% equ 0 (
                            trivy image --severity HIGH,CRITICAL %APP_NAME%:%IMAGE_TAG%
                        ) else (
                            echo WARNING: Trivy security scanner is not installed on Windows host.
                            echo Install via Chocolatey: choco install trivy OR Winget: winget install AquaSecurity.Trivy
                            echo Skipping Trivy security scan stage for current local validation build.
                        )
                    '''
                }
            }

            if (ENABLE_DOCKER_PUSH) {
                stage('Stage 7 — Docker Hub Push') {
                    echo "===> Authenticating and pushing image to Docker Hub..."
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        if (isUnix()) {
                            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                            sh "docker tag ${APP_NAME}:${IMAGE_TAG} $DOCKER_USER/${APP_NAME}:${IMAGE_TAG}"
                            sh "docker push $DOCKER_USER/${APP_NAME}:${IMAGE_TAG}"
                        } else {
                            bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                            bat "docker tag ${APP_NAME}:${IMAGE_TAG} %DOCKER_USER%/${APP_NAME}:${IMAGE_TAG}"
                            bat "docker push %DOCKER_USER%/${APP_NAME}:${IMAGE_TAG}"
                        }
                    }
                }
            }

            if (ENABLE_TERRAFORM) {
                stage('Stage 8 — Terraform Provisioning') {
                    dir('terraform') {
                        withCredentials([usernamePassword(credentialsId: 'aws-credentials', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                            if (isUnix()) {
                                sh 'terraform init && terraform validate && terraform plan -out=tfplan && terraform apply -auto-approve tfplan'
                            } else {
                                bat 'terraform init && terraform validate && terraform plan -out=tfplan && terraform apply -auto-approve tfplan'
                            }
                        }
                    }
                }
            }

            if (ENABLE_ANSIBLE) {
                stage('Stage 9 — Ansible Server Setup') {
                    dir('ansible') {
                        if (isUnix()) {
                            sh 'ansible-playbook -i inventory/hosts.ini playbooks/setup.yml --syntax-check'
                        } else {
                            bat 'ansible-playbook -i inventory/hosts.ini playbooks/setup.yml --syntax-check'
                        }
                    }
                }
            }

            if (ENABLE_KUBERNETES) {
                stage('Stage 10 — Kubernetes Deployment') {
                    withCredentials([file(credentialsId: 'kubeconfig-credentials', variable: 'KUBECONFIG_PATH')]) {
                        if (isUnix()) {
                            sh '''
                                export KUBECONFIG=${KUBECONFIG_PATH}
                                kubectl apply -f k8s/namespace.yaml
                                kubectl apply -f k8s/configmap.yaml
                                kubectl apply -f k8s/deployment.yaml
                                kubectl apply -f k8s/service.yaml
                                kubectl apply -f k8s/ingress.yaml
                                kubectl apply -f k8s/hpa.yaml
                                kubectl rollout status deployment/flappy-bird-deployment -n flappy-bird --timeout=120s
                            '''
                        } else {
                            bat '''
                                set KUBECONFIG=%KUBECONFIG_PATH%
                                kubectl apply -f k8s/namespace.yaml
                                kubectl apply -f k8s/configmap.yaml
                                kubectl apply -f k8s/deployment.yaml
                                kubectl apply -f k8s/service.yaml
                                kubectl apply -f k8s/ingress.yaml
                                kubectl apply -f k8s/hpa.yaml
                                kubectl rollout status deployment/flappy-bird-deployment -n flappy-bird --timeout=120s
                            '''
                        }
                    }
                }
            }
        }
        echo "✅ Jenkins Pipeline executed successfully!"
    } catch (err) {
        echo "❌ Jenkins Pipeline execution failed: ${err.message}"
        throw err
    } finally {
        echo "===> Pipeline execution completed."
    }
}
