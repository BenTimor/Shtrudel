export type DataSource = (key: string) => string | undefined | void;

/**
 * Tries to get the data from all of the data sources. If it succeed with getting it, it returns the value. If not, returns undefined.
 */
function getConfigurable(key: string, dataSources: DataSource[]): string | undefined {
    for (const source of dataSources) {
        const value = source(key);

        if (value !== undefined) {
            return value;
        }
    }
}

export function config(dataSources: DataSource[], defaultPreprocess: (value: string) => any = (v) => v, defaultPreprocessDefault: boolean = true) {
    // Creating the function which returns the decoreator with whatever preprocessing of the value you want
    /**
     * @param preprocess Allows you to pass a function which modifies the value you get from the config.
     */
    return (preprocess: (value: string) => any = defaultPreprocess, preprocessDefault: boolean = defaultPreprocessDefault) => {
        // Here we're returning the decorator itself which gonna modify the variable we're using to contain the config
        return (target: any, key: string) => {
            let defaultValue = target[key];

            Object.defineProperty(target, key, {
                get: () => {
                    // Trying to get some value and processing it if needed
                    const configValue = getConfigurable(key, dataSources);

                    return configValue ?
                        preprocess(configValue) :
                        (preprocessDefault ? preprocess(defaultValue) : defaultValue);
                },
                set: (v) => {
                    // Setting the variable won't change the config. It's only gonna change the default value.
                    defaultValue = v;
                }
            });
        }
    }
}