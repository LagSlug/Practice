import fizzbuz from "../src/fizzbuzz";
var start = process.env.START ? parseInt(process.env.START) : 0,
    end = process.env.END ? parseInt(process.env.END): 100,
    encoding = process.env.ENCODING;

const output = fizzbuz(start, end, encoding);
process.stdout.write(output.join(',\n') + '\n');
