const cdk = require('@aws-cdk/core');
const ec2 = require('@aws-cdk/aws-ec2');
const ecs = require('@aws-cdk/aws-ecs');
const ecs_patterns = require('@aws-cdk/aws-ecs-patterns');

class BaseResources extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, 'FargateVpc', {
            maxAzs: 3,
            natGateways: 1
        });

        this.cluster = new ecs.Cluster(this, 'FargateCluster', {
            vpc: this.vpc
        })
    }
}

class Application extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        this.application = new ecs_patterns.LoadBalancedFargateService(this, 'application', {
            cluster: props.cluster,
            image: ecs.ContainerImage.fromAsset('./react-template'),
            desiredCount: 2,
            cpu: 256,
            memoryLimitMiB: 512,
            publicLoadBalancer: true
        });
    }
}

class CdkApp extends cdk.App {
    constructor(argv) {
        super(argv);

        this.baseResources = new BaseResources(this, 'base-resources');

        this.application = new Application(this, 'application', {
            cluster: this.baseResources.cluster
        });
    }
}

new CdkApp();