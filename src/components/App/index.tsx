import * as React from 'react';
import { AppRootProps } from '@velaux/data';
import * as VelauxUI from '@velaux/ui';
import {
  CreatePipelineRequest,
  Form,
  getBackendSrv,
  Grid,
  listPipelines,
  ListTitle,
  locale,
  PipelineListItem,
  runPipeline,
  Select,
  Table
} from '@velaux/ui';
import { Button, Message } from '@alifd/next';
import { V1Container, V1Deployment, V1DeploymentCondition, V1Namespace, } from '@kubernetes/client-node';
import './index.less';

const { Row, Col } = Grid;
const pluginName = 'vela-adopter'

interface State {
  namespaces?: string[];
  selectNamespace?: string;
  deploys?: Array<V1Deployment>;
}

export class App extends React.PureComponent<AppRootProps, State> {
  constructor(props: AppRootProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.loadNamespaces();
  }

  loadNamespaces = () => {
    getBackendSrv()
      .get(`/proxy/plugins/${pluginName}/api/v1/namespaces`)
      .then((res: any) => {
        console.log(res)
        if (res) {
          // put default to first
          if (res.items) {
            const defaultIndex = res.items.findIndex((ns: V1Namespace) => ns.metadata?.name === 'default');
            if (defaultIndex > 0) {
              const defaultNs = res.items[defaultIndex];
              res.items.splice(defaultIndex, 1);
              res.items.unshift(defaultNs);
            }
          }

          const defaultCluster =
            Array.isArray(res.items) && res.items.length > 0 ? res.items[0].metadata.name : 'default';
          this.setState({
            namespaces: res.items.map((ns: V1Namespace) => ns.metadata?.name),
            selectNamespace: defaultCluster
          }, () => {
            this.loadDeploys();
          });
        }
      });
  };
  loadDeploys = () => {
    const { selectNamespace } = this.state;
    const ns = selectNamespace || 'default';
    console.log(ns)
    getBackendSrv()
      .get(`/proxy/plugins/${pluginName}/apis/apps/v1/namespaces/${ns}/deployments`)
      .then((res: any) => {
        console.log(res)
        if (res) {
          this.setState({ deploys: res.items || [] });
        } else {
          this.setState({ deploys: [] });
        }
      });
  };

  onChangeNamespace = (c: string) => {
    this.setState({ selectNamespace: c }, this.loadDeploys);
  };

  adoptDeployment = (deploy: V1Deployment) => {
    console.log("will adopt", deploy)
  }

  createPipelineAdoptNS = async (namespace: string) => {
    const req: CreatePipelineRequest = {
      name: "adopt-namespace-" + namespace,
      // todo: use which project?
      project: "default",
      description: "Created by Vela Adopter, adopt namespace " + namespace,
      spec: {
        steps: [
          {
            name: "adopt",
            description: 'Adopt namespace ' + namespace,
            type: 'vela-cli',
            properties: {
              command: ['vela', 'adopt', '--all', "--namespace", namespace],
              image: 'oamdev/vela-cli:latest',
            }
          },
        ],
      },
    }
    return await VelauxUI.createPipeline(req)
  }
  runPipelineAdoptNS = (namespace: string) => {
    runPipeline("default", "adopt-namespace-" + namespace,).then(
      (res) => {
        if (res) {
          console.log(res)
        }
      }
    )
  }

  handleAdoptNamespace = async (namespace?: string) => {
    if (!namespace) {
      return
    }
    let pipelinesExist = false
    try {
      const res = await listPipelines({ projectName: 'default' });
      if (res) {
        pipelinesExist = res.pipelines.some((p: PipelineListItem) => p.name === "adopt-namespace-" + namespace);
      }
    } catch (err) {
      console.error('Error while listing pipelines:', err);
    }

    if (pipelinesExist) {
      this.runPipelineAdoptNS(namespace);
    } else {
      try {
        const res = await this.createPipelineAdoptNS(namespace);
        if (res && res.name && res.name !== '') {
          Message.success('Adopt namespace ' + namespace + ' success');
          this.runPipelineAdoptNS(namespace);
        }
      } catch (err: any) {
        console.error('Error while creating pipeline:', err);
        Message.error('Adopt namespace ' + namespace + ' failed');
      }
    }
  }

  render() {
    const { namespaces, deploys, selectNamespace } = this.state;
    const nsOptions = namespaces?.map((c) => {
      return {
        label: c,
        value: c,
      };
    });
    return (
      <div className="page-container">
        <ListTitle title="KubeVela Adopter" subTitle="" />
        <Row align={'center'}>
          <Col span={4}>
            <div className="cluster-select">
              <Form.Item label="Namespace" labelAlign="left">
                <Select
                  locale={locale().Select}
                  dataSource={nsOptions}
                  value={selectNamespace}
                  onChange={this.onChangeNamespace}
                ></Select>
              </Form.Item>
            </div>
          </Col>
          <Col span={6}>
            <div className="adopt-all">
              <Button type={"primary"} onClick={() => this.handleAdoptNamespace(selectNamespace)}>
                Adopt Namespace
              </Button>
            </div>
          </Col>

        </Row>
        <div>
          <Table dataSource={deploys} locale={locale().Table}>
            <Table.Column key={'name'} title="Name" dataIndex={'metadata.name'} />
            <Table.Column
              key={'image'}
              title="Image"
              dataIndex={'spec.template.spec.containers'}
              cell={(containers: V1Container[]) => {
                console.log(containers)
                return containers[0].image
              }}
            />
            <Table.Column
              key={'status'}
              title="Ready"
              dataIndex={'status.conditions'}
              cell={(conditions: V1DeploymentCondition[]) => {
                console.log(conditions)
                return (conditions[0].type === 'Available').toString()
              }}
            />
            <Table.Column
              key={'adopt'}
              title="Adopt"
              dataIndex={''}
              cell={(v, idx, deploy: V1Deployment) => {
                console.log(deploy)
                return <Button
                  type={"primary"}
                  onClick={() => this.adoptDeployment(deploy)}>
                  Adopt
                </Button>
              }} />

          </Table>
        </div>
      </div>
    );
  }
}
