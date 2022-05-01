import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as constructs from 'constructs';
import { Construct } from 'constructs';
import ec2 = require('aws-cdk-lib/aws-ec2');
import ecs = require('aws-cdk-lib/aws-ecs');
import { aws_iam as iam } from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { aws_s3,aws_s3_deployment} from 'aws-cdk-lib';
import {aws_cloudfront,aws_cloudfront_origins,Duration} from 'aws-cdk-lib';

// For ECS Exec
/*
class EnableExecuteCommand implements cdk.IAspect {
  public visit(node: constructs.IConstruct): void {
    if (node instanceof ecs.CfnService) {
      node.addOverride('Properties.EnableExecuteCommand', true);
    }
  }
}
*/

export type AppConfig = {
  baseDomainName: string;
  // hostedZoneId: string;
  certificateArn: string;
  appEnv: 'stg' | 'prd';
}

export interface AppStackProps extends StackProps {
  appConfig: AppConfig;
}

export class CdkFrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Route53
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'MyZone', {
      hostedZoneId: 'Z0027987VXSPGRROHS3A',
      zoneName: 'staging.mine.toggle-pf.com'
    }); 

    // ACM (us-east-1)
    const certificate = new acm.DnsValidatedCertificate(this, 'CrossRegionCertificate', {
      domainName: 'sampleapplication.staging.mine.toggle-pf.com',
      hostedZone: zone,
      region: 'us-east-1',
    });


    // TODO: バケット名をつける
    const buildBucket = new aws_s3.Bucket(this, "BuildBucket",{
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new aws_cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        // /buildを格納したバケットを指定する
        origin: new aws_cloudfront_origins.S3Origin(buildBucket),
        // HTTPS へリダイレクト
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      // ルートへのアクセスに対して返却するコンテンツを設定
      defaultRootObject: "index.html",

      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
      ],
      domainNames: ['sampleapplication.staging.mine.toggle-pf.com'],
      certificate: certificate,      
    });

    // Route 53 でレコードを追加
    new route53.ARecord(this, 'Alias', {
      zone: zone,
      recordName: 'sampleapplication.staging.mine.toggle-pf.com',
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
    });

    //デプロイするフォルダを指定
    new aws_s3_deployment.BucketDeployment(this,'deployreactApp',{
      sources: [aws_s3_deployment.Source.asset('../frontend/app/dist')],
      destinationBucket: buildBucket,
    });    
  }
}
const app = new cdk.App();
app.synth();
