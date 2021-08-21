# Shtrudel - Decorated Config Manager

Shtrudel simply allows you to create config for your application using decorators.

To do it, You first need to decide where you're getting your data from and implement functions which return this data according to some key.

We call those functions `DataSource`. Lets create two DataSource functions:

1) returns data from `process.env`.
2) If the key starts with `length_` it returns the length of the key.

//

    import { DataSource } from "shtrudel";
    
    const DotenvDataSrouce: DataSource = (key: string) => process.env[key];
    
    const LengthDataSource: DataSource = (key: string) => {
        if (key.startsWith("length_")) {
            return `${key.length}`;
        }
    }

Now we're going to create our decorator. That's done by using the `config` function. This function gets our DataSources.

	const configurable = config([DotenvDataSrouce, LengthDataSource]);

After we've done that, We can use this decorator to setup our config. Like this:

	class Config {
	    @configurable()
	    static readonly IS_PRODUCTION = false; // false is the default value

	    // We can pass a function into the decorator which's doing something with the value returnd from our datasources
	    // For example, Here we're telling the configurable decorator to parse the string value into a number
	    @configurable(parseInt) 
	    static readonly length_MY_NAME_IS_BEN: number;

	    @configurable()
	    static readonly I_AM_NOT_IN_ENV_FILE = "default"; // We're going to use the default value here because both DataSources won't return anything for this key.
	}

Note that everytime we read the variable we're checking again against the DataSources.  So we can do something like this:

	import { config, DataSource } from "shtrudel";

	let i = 0;

	const IncreaseNumberDataSource: DataSource = (key: string) => {
	    i += 1;
	    return `${i}`;
	};

	const configurable = config([IncreaseNumberDataSource]);

	class Config {
	    @configurable(parseInt)
	    static readonly OUR_NUMBER: number;
	}

	console.log(Config.OUR_NUMBER); // 1
	console.log(Config.OUR_NUMBER); // 2
	console.log(Config.OUR_NUMBER); // 3

