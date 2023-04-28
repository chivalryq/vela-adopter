import { getBackendSrv } from "@velaux/ui";
import { pluginID } from "../module";
import { V1Namespace } from "@kubernetes/client-node";

export const getNamespaces = async () => {
  let namespaces = [];
  try {
    const res: any= await getBackendSrv().get(`/proxy/plugins/${pluginID}/api/v1/namespaces`);
    if (res && res.items) {
      // put default to first
      const defaultIndex = res.items.findIndex((ns: V1Namespace) => ns.metadata?.name === 'default');
      if (defaultIndex > 0) {
        const defaultNs = res.items[defaultIndex];
        res.items.splice(defaultIndex, 1);
        res.items.unshift(defaultNs);
      }
      namespaces = res.items.map((ns: V1Namespace) => ns.metadata?.name);
    }
    return namespaces;
  } catch (error) {
    // Handle any errors here
    console.error(error);
    throw error;
  }
}

