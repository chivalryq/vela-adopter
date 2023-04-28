import { KeyValue } from "@velaux/data";

export class VelaAdopterConfig {
  disabledNamespaces: string[] = [];
  secretKey: string = '';
}

export const KeyLabel: KeyValue<{ key: string, label: string }> = {
  DisabledNamespaces: {
    key: 'disabledNamespaces',
    label: 'Disabled Namespaces',
  },
  SecretKey: {
    key: 'secretKey',
    label: 'Secret Key',
  }
}
