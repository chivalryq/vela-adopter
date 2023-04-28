import * as React from 'react';
import { useEffect } from 'react';
import { Box, Form, Input, locale, Select, Typography } from '@velaux/ui';
import { AppPluginMeta, PluginConfigPageProps, unmarshal, } from '@velaux/data';
import { getNamespaces } from "../../utils/utils";
import { KeyLabel, VelaAdopterConfig } from "../../api";

export type AppPluginSettings = {};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> {
}

export const AppConfig = ({ plugin, onJSONDataChange, onSecureJSONDataChange }: AppConfigProps) => {
  const { jsonSetting, secureJsonFields } = plugin.meta;
  console.log(jsonSetting, secureJsonFields)
  const { disabledNamespaces } = unmarshal<VelaAdopterConfig>(jsonSetting ?? {})
  const [namespacesLabels, setNamespaces] = React.useState<string[]>([])

  useEffect(() => {
    getNamespaces().then(
      (namespaces) => {
        setNamespaces(namespaces)
      }
    )
  }, [])

  const handleConfigChange = (key: string) => (value: string[]) => {
    onJSONDataChange(key, value)
  }
  const handleSecureConfigChange = (key: string) => (value: string) => {
    onSecureJSONDataChange(key, value)
  }

  const formItemLayout = {
    labelCol: {
      fixedSpan: 8
    },
    wrapperCol: {
      span: 16
    }
  };
  return (
    <Box className="gf-form-group" padding={4}>
      <Box>
        <Typography.H3>Config</Typography.H3>
        <Form {...formItemLayout} style={{ width: "50%" }}>
          <Form.Item label={KeyLabel.DisabledNamespaces.label}>
            <Select dataSource={namespacesLabels} mode={"multiple"}
                    onChange={handleConfigChange(KeyLabel.DisabledNamespaces.key)}
                    defaultValue={disabledNamespaces}
                    locale={locale().Select}
            />
          </Form.Item>
        </Form>
      </Box>
      <Box>
        <Typography.H3>Secure Data</Typography.H3>
        <Form {...formItemLayout} style={{ width: "50%" }}>
          <Form.Item label={KeyLabel.SecretKey.label}>
            <Input onChange={handleSecureConfigChange(KeyLabel.SecretKey.key)}
                   placeholder={secureJsonFields?.[KeyLabel.SecretKey.key]? "******" : undefined}
            />
          </Form.Item>
        </Form>
      </Box>
    </Box>
  );
};


