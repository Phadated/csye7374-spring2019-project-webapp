podTemplate(
    label: 'mypod', 
    inheritFrom: 'default',
    containers: [
        containerTemplate(
            name: 'docker', 
            image: 'docker:18.02',
            ttyEnabled: true,
            command: 'cat'
        ),
        containerTemplate(
            name: 'helm', 
            image: 'ibmcom/k8s-helm:v2.6.0',
            ttyEnabled: true,
            command: 'cat'
        ),
        containerTemplate(
            name: 'kubectl', 
            image: 'lachlanevenson/k8s-kubectl:v1.8.0',
            ttyEnabled: true,
            command: 'cat'
        ),
        containerTemplate(
            name: 'awscli', 
            image: 'atlassian/pipelines-awscli',
            ttyEnabled: true,
            command: 'cat'
        )
    ],
    volumes: [
        hostPathVolume(
            hostPath: '/var/run/docker.sock',
            mountPath: '/var/run/docker.sock'
        )
    ]
) {
    node('mypod') {
        def commitId

        stage ('Extract') {
            checkout scm
            commitId = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
            def ws = pwd()
            echo "work space is : ${workspace}"
            //echo "files: ${files}"
            echo "ws: ${ws}"
        }
        
        def accountid
        def test
        def clustername
        stage('awscli'){
            container ('awscli'){
               withAWS(credentials: 'awskey') {
               // some block
               //accountid = sh (script: "aws route53 list-hosted-zones | jq -r '.HostedZones[1].Name'")
               clustername = sh(script: "aws route53 list-hosted-zones | jq -r '.HostedZones[1].Name'", returnStdout: true).trim()
               def lengthMinus2 = clustername.length() - 1
               clustername = clustername.substring(0, lengthMinus2)
               accountid = sh(script: "aws sts get-caller-identity --output text --query 'Account'", returnStdout: true).trim()
               echo "accountid : ${accountid}"
               echo "${clustername}"
            }
            }
        }
        
        def repository
        stage ('Docker') {
            container ('docker') {
                dir("deploy/webapp"){
                    echo "workspace: ${workspace}"
                    // sh "docker build -t csye7374 ."
                    docker.withRegistry("https://${accountid}.dkr.ecr.us-east-1.amazonaws.com/csye7374", "ecr:us-east-1:awskey") {
           
                        //build image
                        def customImage = docker.build("csye7374")
                        
                        //push image
                        customImage.push("${BUILD_TIMESTAMP}")
                    }
                
            }

        }
        }
        
        stage('Apply Kubernetes files') {
            dir("deploy/k8s/app"){
                container('kubectl'){
                    withKubeConfig([credentialsId: 'jenkins', serverUrl: "https://api.${clustername}"]) {
                        sh "kubectl set image deployment csye7374-assign3-rc csye7374=${accountid}.dkr.ecr.us-east-1.amazonaws.com/csye7374:${BUILD_TIMESTAMP}"
                    }
                }
            }
        }
       
    }
}