#include <bit>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <stdexcept>
#include <vector>
#include <string>
std::vector<float> read(const char* path) {
 std::ifstream f(path,std::ios::binary);
 if(!f) throw std::runtime_error("Cannot open input");
 std::vector<float> out; unsigned char b[4];
 while(f.read(reinterpret_cast<char*>(b),4)) {
  uint32_t n=uint32_t(b[0])|(uint32_t(b[1])<<8)|(uint32_t(b[2])<<16)|(uint32_t(b[3])<<24);
  float v=std::bit_cast<float>(n);
  if(!std::isfinite(v)) throw std::runtime_error("Non-finite sample");
  out.push_back(v);
 }
 if(f.bad()||f.gcount()!=0||out.empty()) throw std::runtime_error("Empty, unreadable or truncated Float32 input");
 return out;
}
int main(int argc,char** argv) {
 try {
  if(argc!=3&&argc!=4) throw std::runtime_error("Usage: signal-compare baseline.f32le current.f32le [tolerance]");
  double tolerance=1e-7;
  if(argc==4) {size_t end; tolerance=std::stod(argv[3],&end);if(end!=std::string(argv[3]).size())throw std::runtime_error("Invalid tolerance");}
  if(!std::isfinite(tolerance)||tolerance<0)throw std::runtime_error("Invalid tolerance");
  auto a=read(argv[1]),b=read(argv[2]);
  if(a.size()!=b.size())throw std::runtime_error("Sample counts differ");
  double max=0,sum=0;size_t changed=0;
  for(size_t i=0;i<a.size();++i){double d=std::abs(double(a[i])-double(b[i]));max=std::max(max,d);sum+=d*d;changed+=d>tolerance;}
  std::cout<<std::setprecision(17)<<"{\"samples\":"<<a.size()<<",\"changed\":"<<changed<<",\"maxAbsoluteError\":"<<max<<",\"rmse\":"<<std::sqrt(sum/a.size())<<",\"tolerance\":"<<tolerance<<"}\n";
  return changed?1:0;
 }catch(const std::exception& e){std::cerr<<e.what()<<'\n';return 2;}
}
