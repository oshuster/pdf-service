import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

export const PROTO_PATH = path.resolve(__dirname, '../../proto/pdf.proto');

console.log('PROTO_PATH: ', PROTO_PATH);

export const loadProto = () => {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return grpc.loadPackageDefinition(packageDefinition) as {
    pdf: { PdfService: { service: grpc.ServiceDefinition<unknown> } };
  };
};
