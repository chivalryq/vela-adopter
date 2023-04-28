import { AppPagePlugin } from '@velaux/data';
import { App } from './components/App';
import { AppConfig } from './components/AppConfig';

export const pluginID = 'vela-adopter';
export const plugin = new AppPagePlugin<{}>().setRootPage(App).addConfigPage({
  title: 'Configuration',
  icon: 'cog',
  body: AppConfig,
  id: 'configuration',
});
