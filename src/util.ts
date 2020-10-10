import {Md5} from 'ts-md5/dist/md5';

export function isYamlSame(yaml1: string, yaml2: string): boolean{  
  return Md5.hashStr(yaml1) === Md5.hashStr(yaml2);
}