import * as React from 'react';
import { Box, Button, disablePlugin, enablePlugin, Input, KeyValue, Typography } from '@velaux/ui';
import { AppPluginMeta, PluginConfigPageProps, PluginEnableRequest, PluginMeta, } from '@velaux/data';

export type AppPluginSettings = {};

export interface AppConfigProps extends PluginConfigPageProps<AppPluginMeta<AppPluginSettings>> {
}

export const AppConfig = ({ plugin }: AppConfigProps) => {
  const { enabled, jsonData, secureJsonData, info } = plugin.meta;
  const [inputJsonData, setInputJsonData] = React.useState<KeyValue>(jsonData as KeyValue ?? {});
  const [inputSecureJsonData, setInputSecureJsonData] = React.useState<KeyValue>(secureJsonData as KeyValue ?? {});
  const [newKeyValuePair, setNewKeyValuePair] = React.useState({ key: '', value: '' });

  const handleJsonDataChange = (key: string, value: string) => {
    setInputJsonData({ ...inputJsonData, [key]: value });
  };

  const handleSecureJsonDataChange = (key: string, value: string) => {
    setInputSecureJsonData({ ...inputSecureJsonData, [key]: value });
  };

  // const handleNewKeyChange = (value: string) => {
  //   setNewKeyValuePair({ ...newKeyValuePair, key: value });
  // };
  //
  // const handleNewValueChange = (value: string) => {
  //   setNewKeyValuePair({ ...newKeyValuePair, value });
  // };

  const addNewJsonData = () => {
    if (newKeyValuePair.key) {
      setInputJsonData({ ...inputJsonData, [newKeyValuePair.key]: newKeyValuePair.value });
      setNewKeyValuePair({ key: '', value: '' });
    }
  };

  const addNewSecureJsonData = () => {
    if (newKeyValuePair.key) {
      setInputSecureJsonData({ ...inputSecureJsonData, [newKeyValuePair.key]: newKeyValuePair.value });
      setNewKeyValuePair({ key: '', value: '' });
    }
  };

  return (
    <Box className="gf-form-group">
      <Typography.H2>{plugin.meta.name} {info.version && `v${info.version}`}</Typography.H2>
      <Typography.Text>{info.description}</Typography.Text>
      <Typography.Text>{info.author && `Author: ${info.author.name}`}</Typography.Text>
      <br />
      <br />
      <Box>
        <Typography.H3>JSON Data:</Typography.H3>
        {Object.entries(inputJsonData).map(([key, value]) => (
          <Box key={key}>
            <label>{key}:</label>
            <Input
              value={value}
              onChange={(value) => handleJsonDataChange(key, value)}
            />
            <Button
              type="primary"
              style={{ minWidth: 'fit-content', padding: '4px 12px' }}
              onClick={addNewJsonData}
            >
              Add
            </Button>
          </Box>
        ))}
      </Box>
      <br />
      <Box>
        <Typography.H3>Secure JSON Data:</Typography.H3>
        {Object.entries(inputSecureJsonData).map(([key, value]) => (
          <Box key={key}>
            <label>{key}:</label>
            <Input
              value={value}
              onChange={(value) => handleSecureJsonDataChange(key, value)}
            />
            <Button
              type="primary"
              style={{ minWidth: 'fit-content', padding: '4px 12px' }}
              onClick={addNewSecureJsonData}>
              Add
            </Button>
          </Box>
        ))}
      </Box>
      <Box>
        {/* Enable/Disable the plugin */}
        <Typography.H3>Enable / Disable</Typography.H3>
        {!enabled && (
          <>
            <Typography.Text>The plugin is currently not enabled.</Typography.Text>
            <Button
              type="primary"
              style={{ minWidth: 'fit-content', padding: '4px 12px' }}
              onClick={() =>
                updatePluginAndReload(plugin.meta.id, {
                  enabled: true,
                  jsonData: inputJsonData,
                  secureJsonData: inputSecureJsonData,
                })
              }>
              Enable plugin
            </Button>
          </>
        )}

        {enabled && (
          <>
            <Typography.Text>The plugin is currently enabled.</Typography.Text>
            <Button
              type="secondary"
              style={{ minWidth: 'fit-content', padding: '4px 12px' }}
              onClick={() =>
                updatePluginAndReload(plugin.meta.id, {
                  enabled: false,
                  jsonData: inputJsonData,
                  secureJsonData: inputSecureJsonData,
                })
              }>
              Disable plugin
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

const updatePluginAndReload = async (pluginId: string, data: Partial<PluginMeta>) => {
  try {
    const action = data.enabled ? enablePlugin : disablePlugin;
    const params: PluginEnableRequest = {
      id: pluginId,
      jsonData: data.jsonData ? data.jsonData : {},
      secureJsonData: data.secureJsonData ? data.secureJsonData : {},
    };
    await action(params)
      .then((res: any) => {
        console.log(res);
      })
      .catch((err: any) => {
        console.log(err);
      });
// Reloading the page as the changes made here wouldn't be propagated to the actual plugin otherwise.
// This is not ideal, however unfortunately currently there is no supported way for updating the plugin state.
    window.location.reload();
  } catch (e) {
    console.error('Error while updating the plugin', e);
  }
};

